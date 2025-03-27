const { createClient } = supabase;
const _supabase = createClient('https://aeddjyzfhozlagrfbmkq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlZGRqeXpmaG96bGFncmZibWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NTgxNzIsImV4cCI6MjA1NzQzNDE3Mn0.akGZ7JQQ8RTF4Euu8_NYO5wIiBc4fISNvWtb6WY8rTE');

async function saveData(nickname, score) {
  const { data, error } = await _supabase
  .from('records')
  .insert([{nickname, score}]);

  if (error) {
    console.log("Ошибка: ", error);
  }
}
  
async function loadData() {
  const { data, error } = await _supabase
  .from('records')
  .select('nickname, score')
  .order('score', {ascending: false});

  dbArr = data;
  // console.log(dbArr);

  if (error) {
    console.log("Ошибка: ", error);
  }
}