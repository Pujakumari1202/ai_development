--
-- PostgreSQL database dump
--

\restrict 4cCbovWGHpt2gDIiiwiK2g9ajb0K9UzeTvjm63gWbeiGDgcsZZbDSHjtf3TuGKi

-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 17.10 (Debian 17.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: conversation_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.conversation_sessions VALUES ('customer-puja', '{"product_name": "luisine bread", "last_db_result": [{"price": 5.15, "product_id": 3, "supplier_id": 2, "phone_number": "6290363971", "product_name": "Luisine Bread", "supplier_name": "Farhan", "turnaround_time": "2 days"}, {"price": 5.25, "product_id": 2, "supplier_id": 1, "phone_number": "8583930417", "product_name": "Luisine Bread", "supplier_name": "Puja", "turnaround_time": "1 day"}], "turnaround_time": "unspecified", "last_operation_summary": "User requested ''luisine bread'' but did not provide product name, quantity, delivery, or supplier details."}', '2026-07-26 06:14:57.380087', '2026-07-26 06:15:28.429172');
INSERT INTO public.conversation_sessions VALUES ('customer-farhan', '{"product_name": "QBake bread", "last_db_result": [{"price": 5.0, "product_id": 1, "supplier_id": 1, "phone_number": "8583930417", "product_name": "QBake Bread", "supplier_name": "Puja", "turnaround_time": "1 day"}], "turnaround_time": "not specified", "last_operation_summary": "User requests QBake bread but quantity, delivery date/location, supplier, and packaging details are missing."}', '2026-07-26 06:16:12.765063', '2026-07-26 06:16:44.676055');


--
-- Data for Name: conversation_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.conversation_messages VALUES (1, 'customer-puja', 'customer', 'I want luisine bread', '2026-07-26 06:15:28.389432');
INSERT INTO public.conversation_messages VALUES (2, 'customer-puja', 'assistant', 'Got it — Luisine Bread is available from two suppliers in the system. Summary:

- Farhan (supplier_id 2) — price $5.15, turnaround 2 days, phone 6290363971  
- Puja (supplier_id 1) — price $5.25, turnaround 1 day, phone 8583930417

Next I need two things to proceed:
1. Quantity (units or loafs) and delivery address/date (when you need it).  
2. Do you prefer the lower price (Farhan, slower) or the faster delivery (Puja, slightly higher), or should I confirm availability and place the order with the best match?

Tell me your quantity and preference and I’ll either contact the supplier to confirm and place the order or get back with any updates.', '2026-07-26 06:15:28.411024');
INSERT INTO public.conversation_messages VALUES (3, 'customer-farhan', 'customer', 'I want QBake bread', '2026-07-26 06:16:44.635559');
INSERT INTO public.conversation_messages VALUES (4, 'customer-farhan', 'assistant', 'Got it — QBake Bread.

I found one supplier:
- Puja — price $5 per unit, turnaround 1 day, phone: 858-393-0417.

I’m missing a few details before I can place or confirm an order. Please confirm:
1. Quantity (units/loaves or weight).  
2. Delivery date and delivery location (or pickup).  
3. Packaging preference (individual loaves, packs, pallets, special packaging).  
4. Do you want me to proceed with Puja at the listed price and turnaround, or would you like me to try negotiating or look for other suppliers?

Next step once you confirm the above: I will contact the supplier to place the order and confirm ETA and any delivery instructions, then report back with confirmation.', '2026-07-26 06:16:44.658988');


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.customers VALUES (1, 'Nishat', '7980827269');


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.suppliers VALUES (1, 'Puja', '8583930417', '1 day');
INSERT INTO public.suppliers VALUES (2, 'Farhan', '6290363971', '2 days');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders VALUES (1, 1, 1);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products VALUES (1, 'QBake Bread', 1, 5.00);
INSERT INTO public.products VALUES (2, 'Luisine Bread', 1, 5.25);
INSERT INTO public.products VALUES (3, 'Luisine Bread', 2, 5.15);


--
-- Data for Name: order_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_lines VALUES (1, 2, 1, 5.00, -0.25, 200);


--
-- Name: conversation_messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversation_messages_message_id_seq', 4, true);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_customer_id_seq', 1, false);


--
-- Name: order_lines_order_line_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_lines_order_line_id_seq', 1, false);


--
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 1, false);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_product_id_seq', 1, false);


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_supplier_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict 4cCbovWGHpt2gDIiiwiK2g9ajb0K9UzeTvjm63gWbeiGDgcsZZbDSHjtf3TuGKi

