const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function getSheetNames(spreadsheetId: string): Promise<{ name: string; gid: string }[]> {
  // Fetch the HTML page to extract sheet names and gids
  const htmlUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  const res = await fetch(htmlUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Cannot access spreadsheet (status ${res.status}). Make sure the sheet is set to "Anyone with the link can view".`);
  }

  const html = await res.text();

  // Try to extract sheet info from the HTML
  // Google Sheets embeds sheet metadata in the page
  const sheets: { name: string; gid: string }[] = [];

  // Pattern 1: Look for sheet tab elements
  const tabPattern = /gid=(\d+)[^>]*>([^<]+)</g;
  let match;
  while ((match = tabPattern.exec(html)) !== null) {
    sheets.push({ gid: match[1], name: match[2].trim() });
  }

  // Pattern 2: Try the JSON-like structure embedded in the page
  if (sheets.length === 0) {
    const jsonPattern = /"name"\s*:\s*"([^"]+)"\s*,\s*"index"\s*:\s*\d+\s*,\s*"sheetId"\s*:\s*(\d+)/g;
    while ((match = jsonPattern.exec(html)) !== null) {
      sheets.push({ name: match[1], gid: match[2] });
    }
  }

  // Fallback: just try gid=0 as the default sheet
  if (sheets.length === 0) {
    // Try to get the pub page which lists sheets
    const pubUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/pubhtml`;
    const pubRes = await fetch(pubUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (pubRes.ok) {
      const pubHtml = await pubRes.text();
      const sheetTabPattern = /id="sheet-button-(\d+)"[^>]*>([^<]+)</g;
      while ((match = sheetTabPattern.exec(pubHtml)) !== null) {
        sheets.push({ gid: match[1], name: match[2].trim() });
      }
    }
  }

  // Last fallback: just use gid=0
  if (sheets.length === 0) {
    sheets.push({ name: 'Sheet1', gid: '0' });
  }

  return sheets;
}

async function fetchSheetCsv(spreadsheetId: string, gid: string): Promise<string> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(csvUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch sheet gid=${gid} (status ${res.status})`);
  }

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
    const sheets = await getSheetNames(spreadsheetId);
    console.log('Found sheets:', sheets.map(s => s.name));

    // Fetch CSV for each sheet
    const results: { sheetName: string; csv: string; error?: string }[] = [];

    for (const sheet of sheets) {
      try {
        const csv = await fetchSheetCsv(spreadsheetId, sheet.gid);
        results.push({ sheetName: sheet.name, csv });
      } catch (err) {
        console.error(`Error fetching sheet ${sheet.name}:`, err);
        results.push({ sheetName: sheet.name, csv: '', error: err.message });
      }
    }

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
