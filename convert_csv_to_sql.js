const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'supabase', 'samples.csv');
const sqlPath = path.join(__dirname, 'supabase', 'insert_samples.sql');

if (!fs.existsSync(csvPath)) {
  console.error(`Error: CSV file not found at ${csvPath}`);
  process.exit(1);
}

const content = fs.readFileSync(csvPath, 'utf-8');
// Split by lines, handling CRLF
const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

const sqlStatements = ['-- Insert sample data into mood_logs', 'DELETE FROM mood_logs; -- Clear existing logs for a fresh seed'];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  
  if (fields.length < 7) {
    console.warn(`Skipping invalid line ${i + 1}: ${line}`);
    continue;
  }
  
  let [id, mood_score, feeling, reason, change_reason, created_at] = fields;
  
  // Data sanitization and default fallbacks
  const valId = id.trim() ? `'${id.trim()}'` : 'gen_random_uuid()';
  const valMoodScore = parseInt(mood_score.trim(), 10);
  
  if (isNaN(valMoodScore)) {
    console.warn(`Skipping line ${i + 1} due to invalid mood score: ${mood_score}`);
    continue;
  }
  
  // Escape single quotes for SQL insertion
  const valFeeling = feeling.trim().replace(/'/g, "''");
  const valReason = reason.trim().replace(/'/g, "''");
  const valChangeReason = change_reason.trim().replace(/'/g, "''");
  const valCreatedAt = created_at.trim() ? `'${created_at.trim()}'` : 'NOW()';
  
  const stmt = `INSERT INTO mood_logs (id, mood_score, feeling, reason, change_reason, created_at) VALUES (${valId}, ${valMoodScore}, '${valFeeling}', '${valReason}', '${valChangeReason}', ${valCreatedAt});`;
  sqlStatements.push(stmt);
}

fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');
console.log(`Generated ${sqlStatements.length - 2} INSERT statements in ${sqlPath}`);
