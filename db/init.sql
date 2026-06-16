--
-- PostgreSQL database dump
--

\restrict siSMZEmTrf4H8ZDunR8ijLpZDNV07PufaXC1o240f8MKKUTCbAYmjkJoLh6Ryvl

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id integer NOT NULL,
    sku character varying(50) NOT NULL,
    product_name character varying(255) NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_id_seq OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, sku, product_name, description, price) FROM stdin;
1	QB001	Classic White Bread	Soft and freshly baked white sandwich bread	45.00
2	QB002	Whole Wheat Bread	Healthy whole wheat loaf rich in fiber	55.00
3	QB003	Multigrain Bread	Nutritious bread made with multiple grains and seeds	65.00
4	QB004	Milk Bread	Soft and fluffy milk bread loaf	60.00
5	QB005	Garlic Bread	Freshly baked garlic-flavored bread	80.00
6	QB006	Brown Bread	Low-fat brown bread suitable for daily consumption	50.00
7	QB007	Burger Buns	Pack of 6 soft burger buns	70.00
8	QB008	Hot Dog Buns	Pack of 6 freshly baked hot dog buns	70.00
9	QB009	Chocolate Bread	Sweet bread with chocolate filling	90.00
10	QB010	Fruit Bread	Bread loaf containing mixed dry fruits and raisins	95.00
11	QB011	Sourdough Bread	Artisanal sourdough loaf with a crispy crust and tangy flavor	120.00
\.


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 11, true);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict siSMZEmTrf4H8ZDunR8ijLpZDNV07PufaXC1o240f8MKKUTCbAYmjkJoLh6Ryvl

