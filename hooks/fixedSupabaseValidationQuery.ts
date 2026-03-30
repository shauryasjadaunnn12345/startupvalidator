// This file contains a fixed Supabase query for validations, filtering out ai_status 'rejected' and 'flagged', and ensuring startup_id is not null.

const { data, error } = await supabase
  .from('validations')
  .select('*')
  .not('ai_status', 'in', '("rejected","flagged")')
  .not('startup_id', 'is', null);

// Use this query wherever you need to filter validations accordingly.
