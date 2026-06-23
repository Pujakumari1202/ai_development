--
-- PostgreSQL database dump
--

\restrict IMuK3QFOuCCBaNRQfl7qAnVrd0crOWUucArgvFFzA1prS0A7R9aVWfSN9uyK8Gq

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

\unrestrict IMuK3QFOuCCBaNRQfl7qAnVrd0crOWUucArgvFFzA1prS0A7R9aVWfSN9uyK8Gq

