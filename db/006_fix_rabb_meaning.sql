-- Fix: رَبّ (rabb) noun had incorrect meaning "usury, interest-based increase"
-- which belongs to رِبَا (riba). Correct meaning is Lord, Sustainer, Nurturer.
UPDATE nouns
SET meaning = 'Lord, Sustainer, Nurturer, Master'
WHERE lemma = 'رَبّ'
  AND meaning ILIKE '%usury%';
