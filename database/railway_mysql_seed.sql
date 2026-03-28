INSERT INTO interests (name, personality_affinity, is_system_defined)
VALUES
  ('Listening to music', 'Introvert', 1),
  ('Reading', 'Introvert', 1),
  ('Spending time alone', 'Introvert', 1),
  ('Hiking', 'Ambivert', 1),
  ('Gaming', 'Ambivert', 1),
  ('Volunteering', 'Ambivert', 1),
  ('Attending parties', 'Extrovert', 1),
  ('Concerts', 'Extrovert', 1),
  ('Public events', 'Extrovert', 1)
ON DUPLICATE KEY UPDATE
  personality_affinity = VALUES(personality_affinity),
  is_system_defined = VALUES(is_system_defined);

INSERT INTO healthy_tips (personality_type, sort_order, tip_text)
VALUES
  ('Introvert', 1, 'Protect quiet recharge time so social energy does not drain too quickly.'),
  ('Introvert', 2, 'Prioritize deep one-on-one connections over large, noisy group settings.'),
  ('Introvert', 3, 'Use journaling, music, or mindful solo routines to process emotions.'),
  ('Introvert', 4, 'Choose low-pressure activities that help you reset before reconnecting.'),
  ('Ambivert', 1, 'Balance social plans with protected alone time to avoid overload.'),
  ('Ambivert', 2, 'Set clear boundaries so your energy stays steady across the week.'),
  ('Ambivert', 3, 'Check in with yourself before saying yes to every invitation.'),
  ('Ambivert', 4, 'Mix solo reflection with group connection to stay grounded.'),
  ('Extrovert', 1, 'Look for active collaboration and social learning opportunities.'),
  ('Extrovert', 2, 'Practice active listening so conversations stay balanced and supportive.'),
  ('Extrovert', 3, 'Use networking and group engagement to stay motivated.'),
  ('Extrovert', 4, 'Plan recovery moments so high social energy stays sustainable.')
ON DUPLICATE KEY UPDATE
  tip_text = VALUES(tip_text);

INSERT INTO personality_questions (question_code, question_text, display_order, is_active)
VALUES
  ('personality_q1', 'A free evening sounds best when it looks like...', 1, 1),
  ('personality_q2', 'When you enter a new group, you usually...', 2, 1),
  ('personality_q3', 'After a long week, your energy comes back fastest through...', 3, 1),
  ('personality_q4', 'Your ideal conversation style is usually...', 4, 1),
  ('personality_q5', 'When life feels overwhelming, you are most likely to...', 5, 1)
ON DUPLICATE KEY UPDATE
  question_text = VALUES(question_text),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'A', 'music, journaling, and time to myself', 'Introvert', 1
FROM personality_questions
WHERE question_code = 'personality_q1'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'B', 'a calm hangout, then a little alone time', 'Ambivert', 2
FROM personality_questions
WHERE question_code = 'personality_q1'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'C', 'meeting people, chatting, and staying out late', 'Extrovert', 3
FROM personality_questions
WHERE question_code = 'personality_q1'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'A', 'observe first and open up slowly', 'Introvert', 1
FROM personality_questions
WHERE question_code = 'personality_q2'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'B', 'adjust based on the vibe of the room', 'Ambivert', 2
FROM personality_questions
WHERE question_code = 'personality_q2'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'C', 'jump in and start conversations quickly', 'Extrovert', 3
FROM personality_questions
WHERE question_code = 'personality_q2'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'A', 'quiet solo time and low stimulation', 'Introvert', 1
FROM personality_questions
WHERE question_code = 'personality_q3'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'B', 'a mix of rest and a little social time', 'Ambivert', 2
FROM personality_questions
WHERE question_code = 'personality_q3'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'C', 'being around people and active plans', 'Extrovert', 3
FROM personality_questions
WHERE question_code = 'personality_q3'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'A', 'deep one-on-one talks with trusted people', 'Introvert', 1
FROM personality_questions
WHERE question_code = 'personality_q4'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'B', 'switching between small groups and private chats', 'Ambivert', 2
FROM personality_questions
WHERE question_code = 'personality_q4'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'C', 'open, energetic, and easy with many people', 'Extrovert', 3
FROM personality_questions
WHERE question_code = 'personality_q4'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'A', 'step back, recharge, and process privately', 'Introvert', 1
FROM personality_questions
WHERE question_code = 'personality_q5'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'B', 'pause, reflect, then reconnect when ready', 'Ambivert', 2
FROM personality_questions
WHERE question_code = 'personality_q5'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);

INSERT INTO personality_question_options (question_id, option_code, option_text, mapped_personality, display_order)
SELECT id, 'C', 'talk it out and stay connected with others', 'Extrovert', 3
FROM personality_questions
WHERE question_code = 'personality_q5'
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text), mapped_personality = VALUES(mapped_personality), display_order = VALUES(display_order);
