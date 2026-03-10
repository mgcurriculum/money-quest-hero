const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function getSheetNames(spreadsheetId: string): Promise<string[]> {
  // Use the gviz endpoint to discover sheets - fetch page 1 first to get sheet list
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=__PROBE__`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });
  
  // Even if this fails, we can try the htmlview approach
  // Try fetching the HTML export page which lists all sheets
  const htmlUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/htmlview`;
  const htmlRes = await fetch(htmlUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });

  if (!htmlRes.ok) {
    throw new Error(`Cannot access spreadsheet (status ${htmlRes.status}). Make sure the sheet is set to "Anyone with the link can view".`);
  }

  const html = await htmlRes.text();
  const sheets: string[] = [];

  // Look for sheet names in the HTML - they appear in tab elements
  // Pattern: id="sheet-button-xxx">SheetName</a> or similar
  const patterns = [
    /id="sheet-button-\d+"[^>]*>([^<]+)</g,
    /<li[^>]*class="[^"]*sheet-tab[^"]*"[^>]*>([^<]+)</g,
    /switchToSheet\([^)]*\)[^>]*>([^<]+)</g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const name = match[1].trim();
      if (name && !sheets.includes(name)) {
        sheets.push(name);
      }
    }
  }

  // Another pattern: look for sheet names in JSON-like metadata
  if (sheets.length === 0) {
    const jsonPattern = /"name"\s*:\s*"([^"]+)"/g;
    let match;
    const seen = new Set<string>();
    while ((match = jsonPattern.exec(html)) !== null) {
      const name = match[1].trim();
      if (name && !seen.has(name) && name.length < 50) {
        seen.add(name);
        sheets.push(name);
      }
    }
  }

  // Try pubhtml as another fallback
  if (sheets.length === 0) {
    const pubUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/pubhtml`;
    const pubRes = await fetch(pubUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (pubRes.ok) {
      const pubHtml = await pubRes.text();
      const tabPattern = /id="sheet-button-\d+"[^>]*>([^<]+)</g;
      let match;
      while ((match = tabPattern.exec(pubHtml)) !== null) {
        const name = match[1].trim();
        if (name && !sheets.includes(name)) {
          sheets.push(name);
        }
      }
    }
  }

  console.log('Discovered sheets from HTML:', sheets);
  return sheets;
}

async function fetchSheetCsvByName(spreadsheetId: string, sheetName: string): Promise<string> {
  // Use gviz endpoint which accepts sheet name directly - most reliable for public sheets
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(csvUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });

  if (!res.ok) {
    // Fallback: try export endpoint with sheet name
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`;
    const res2 = await fetch(exportUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    if (!res2.ok) {
      throw new Error(`Failed to fetch sheet "${sheetName}" (status ${res.status}/${res2.status})`);
    }
    return await res2.text();
  }

  // gviz wraps values in quotes - the output is already CSV format
  return await res.text();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'Google Sheets URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const spreadsheetId = extractSpreadsheetId(url);
    if (!spreadsheetId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching spreadsheet:', spreadsheetId);

    // Get sheet names
    let sheetNames = await getSheetNames(spreadsheetId);
    
    // If no sheets discovered, try common profile codes directly
    if (sheetNames.length === 0) {
      console.log('No sheets discovered via HTML, trying known profile codes...');
      // Try fetching a known sheet to verify access
      const testNames = ['A1_SAL', 'A1_STU', 'Sheet1'];
      for (const name of testNames) {
        try {
          await fetchSheetCsvByName(spreadsheetId, name);
          // If we get here, the sheet exists - but we still don't know all sheets
          // Just try all common profile codes
          sheetNames = [
            'A1_SAL', 'A1_STU', 'A1_HOM', 'A1_BUS', 'A1_SELF',
            'A2_SAL', 'A2_STU', 'A2_HOM', 'A2_BUS', 'A2_SELF',
            'A3_SAL', 'A3_STU', 'A3_HOM', 'A3_BUS', 'A3_SELF',
            'A4_SAL', 'A4_HOM', 'A4_BUS', 'A4_RET',
          ];
          break;
        } catch {
          continue;
        }
      }
    }

    console.log('Sheets to fetch:', sheetNames);

    // Fetch CSV for each sheet
    const results: { sheetName: string; csv: string; error?: string }[] = [];

    for (const sheetName of sheetNames) {
      try {
        const csv = await fetchSheetCsvByName(spreadsheetId, sheetName);
        // Only include if csv has actual data (more than just a header)
        const lines = csv.trim().split('\n');
        if (lines.length > 1) {
          results.push({ sheetName, csv });
          console.log(`Fetched sheet "${sheetName}": ${lines.length} rows`);
        } else {
          console.log(`Sheet "${sheetName}" is empty, skipping`);
        }
      } catch (err) {
        // Don't log error for sheets that simply don't exist when we're probing
        console.log(`Sheet "${sheetName}" not available: ${err.message}`);
        results.push({ sheetName, csv: '', error: err.message });
      }
    }

    const successfulSheets = results.filter(r => !r.error && r.csv);
    console.log(`Successfully fetched ${successfulSheets.length} sheets`);

    return new Response(
      JSON.stringify({ success: true, sheets: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch Google Sheet' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
