SELECT setval('public.requests_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.requests));
SELECT setval('public.transactions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.transactions));