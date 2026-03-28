# IntroVibe Railway MySQL

Files added:

- `database/railway_mysql_schema.sql`
- `database/railway_mysql_seed.sql`

## Coverage

- `users`
- `interests`, `user_interests`
- `healthy_tips`
- `personality_questions`, `personality_question_options`
- `personality_assessments`, `personality_assessment_answers`
- `sudoku_progress`
- `user_settings`
- `match_recommendations`
- `direct_conversations`, `direct_messages`, `direct_message_reads`
- `group_chats`, `group_chat_members`, `group_messages`, `group_message_reads`

## Import Order

1. Run the schema file first.
2. Run the seed file second.

```bash
mysql -h <HOST> -P <PORT> -u <USER> -p <DATABASE> < database/railway_mysql_schema.sql
mysql -h <HOST> -P <PORT> -u <USER> -p <DATABASE> < database/railway_mysql_seed.sql
```

## Important Notes

- Use `password_hash`, not plain passwords.
- The current app already uses UUIDs, so the schema stores app-owned IDs as `CHAR(36)`.
- For 1-on-1 chat, generate `conversation_key` by sorting the two user UUIDs and joining them with `:`.
- `users.personality_type` is the active visible result.
- `personality_assessments` keeps assessment history.

## Suggested App Mapping

- Signup:
  Insert into `users`, then insert selected interests into `user_interests`, then create `user_settings`.
- Personality test:
  Insert into `personality_assessments`, insert 5 answers into `personality_assessment_answers`, then update `users.personality_type`.
- Sudoku:
  Update `sudoku_progress`, then set `users.sudoku_completed = 1` when finished.
- Matching:
  Compute shared interests + same personality, then upsert into `match_recommendations`.
- Chat:
  Use direct chat tables for all users, and group chat tables only for Ambiverts and Extroverts.
