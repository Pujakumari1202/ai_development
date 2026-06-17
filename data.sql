--
-- PostgreSQL database dump
--

\restrict XMn46o89kkPvhUMbnjKDa7NBsQUhbTj9kBaCjDDgsAPRPw1yoxwQs8XkvRiSXgh

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

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
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product VALUES ('QB001', 'Classic White Bread', 'Soft and freshly baked white sandwich bread', 45.00, 1);
INSERT INTO public.product VALUES ('QB002', 'Whole Wheat Bread', 'Healthy whole wheat loaf rich in fiber', 55.00, 2);
INSERT INTO public.product VALUES ('QB003', 'Multigrain Bread', 'Nutritious bread made with multiple grains and seeds', 65.00, 3);
INSERT INTO public.product VALUES ('QB004', 'Milk Bread', 'Soft and fluffy milk bread loaf', 60.00, 4);
INSERT INTO public.product VALUES ('QB005', 'Garlic Bread', 'Freshly baked garlic-flavored bread', 80.00, 5);
INSERT INTO public.product VALUES ('QB006', 'Brown Bread', 'Low-fat brown bread suitable for daily consumption', 50.00, 6);
INSERT INTO public.product VALUES ('QB007', 'Burger Buns', 'Pack of 6 soft burger buns', 70.00, 7);
INSERT INTO public.product VALUES ('QB008', 'Hot Dog Buns', 'Pack of 6 freshly baked hot dog buns', 70.00, 8);
INSERT INTO public.product VALUES ('QB009', 'Chocolate Bread', 'Sweet bread with chocolate filling', 90.00, 9);
INSERT INTO public.product VALUES ('QB010', 'Fruit Bread', 'Bread loaf containing mixed dry fruits and raisins', 95.00, 10);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 10, true);


--
-- PostgreSQL database dump complete
--

\unrestrict XMn46o89kkPvhUMbnjKDa7NBsQUhbTj9kBaCjDDgsAPRPw1yoxwQs8XkvRiSXgh

