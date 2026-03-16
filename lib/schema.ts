/**
 * Silver layer table schemas for the LLM context.
 * These are passed as system context to Claude when generating SQL.
 */

export const SILVER_LAYER_SCHEMA = `
-- Microsoft Fabric Silver Layer: The Mole Clinic
-- All monetary values in GBP. Dates are UTC.

CREATE TABLE dim_clinics (
    clinic_id       INT PRIMARY KEY,
    clinic_name     NVARCHAR(100),   -- e.g. 'Wilmslow', 'London Harley St', 'London City', 'Birmingham', 'Manchester', 'Leeds', 'Bristol', 'Edinburgh'
    city            NVARCHAR(100),
    region          NVARCHAR(100),   -- e.g. 'North West', 'London', 'Midlands', 'Yorkshire', 'South West', 'Scotland'
    open_date       DATE,
    is_active       BIT
);

CREATE TABLE dim_practitioners (
    practitioner_id   INT PRIMARY KEY,
    full_name         NVARCHAR(200),
    role              NVARCHAR(50),    -- 'Dermatologist', 'Nurse', 'Admin'
    clinic_id         INT REFERENCES dim_clinics(clinic_id),
    start_date        DATE,
    is_active         BIT
);

CREATE TABLE dim_patients (
    patient_id        INT PRIMARY KEY,
    age_band          NVARCHAR(20),    -- '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
    gender            NVARCHAR(10),    -- 'Male', 'Female', 'Other'
    referral_source   NVARCHAR(100),   -- 'GP Referral', 'Self-Referral', 'Online', 'Corporate'
    first_seen_date   DATE,
    is_new_patient    BIT              -- 1 if first appointment ever
);

CREATE TABLE dim_services (
    service_id        INT PRIMARY KEY,
    service_name      NVARCHAR(200),   -- e.g. 'Full Body Mole Mapping', 'Single Lesion Check', 'Dermoscopy', 'Cryotherapy'
    category          NVARCHAR(100),   -- 'Diagnostic', 'Treatment', 'Follow-up', 'Consultation'
    standard_price    DECIMAL(10,2),
    duration_mins     INT
);

CREATE TABLE fact_appointments (
    appointment_id    BIGINT PRIMARY KEY,
    appointment_date  DATE,
    appointment_time  TIME,
    clinic_id         INT REFERENCES dim_clinics(clinic_id),
    practitioner_id   INT REFERENCES dim_practitioners(practitioner_id),
    patient_id        INT REFERENCES dim_patients(patient_id),
    service_id        INT REFERENCES dim_services(service_id),
    status            NVARCHAR(20),    -- 'Attended', 'Cancelled', 'No-Show', 'Rescheduled'
    cancel_reason     NVARCHAR(200),   -- NULL unless status = 'Cancelled'
    booking_channel   NVARCHAR(50),    -- 'Online', 'Phone', 'Walk-in', 'Referral'
    lead_time_days    INT              -- days between booking and appointment
);

CREATE TABLE fact_invoices (
    invoice_id        BIGINT PRIMARY KEY,
    invoice_date      DATE,
    appointment_id    BIGINT REFERENCES fact_appointments(appointment_id),
    clinic_id         INT REFERENCES dim_clinics(clinic_id),
    patient_id        INT REFERENCES dim_patients(patient_id),
    service_id        INT REFERENCES dim_services(service_id),
    amount            DECIMAL(10,2),
    discount          DECIMAL(10,2),
    net_amount        DECIMAL(10,2),   -- amount - discount
    payment_status    NVARCHAR(20),    -- 'Paid', 'Pending', 'Refunded'
    payment_method    NVARCHAR(50)     -- 'Card', 'Cash', 'Insurance', 'Corporate'
);
`;

export const SQL_GENERATION_SYSTEM_PROMPT = `You are a T-SQL expert for The Mole Clinic (TMC), a private dermatology business with clinics across the UK.

Your job is to convert natural language questions into accurate T-SQL queries against our Microsoft Fabric silver layer.

SCHEMA:
${SILVER_LAYER_SCHEMA}

RULES:
1. Write clean, readable T-SQL (Microsoft SQL Server syntax — for Fabric SQL endpoint)
2. Always use table aliases (e.g. fa for fact_appointments, fi for fact_invoices)
3. For date comparisons, use CAST(column AS DATE) or DATEADD patterns
4. "This week" = current ISO week. "Last week" = ISO week - 1. Use DATEPART(ISO_WEEK, ...)
5. For revenue queries, use SUM(fi.net_amount) from fact_invoices where payment_status = 'Paid'
6. Cancellation rate = COUNT(cancelled) / COUNT(all) * 100.0
7. When a clinic scope is provided, add a WHERE clause filtering by clinic name
8. Limit result sets to 100 rows unless the user asks for more
9. Add ORDER BY clauses that make sense for the question
10. Use WITH (NOLOCK) hints for performance on large tables

Respond in JSON format:
{
  "sql": "<the T-SQL query>",
  "explanation": "<one sentence explaining what the query does>"
}`;

export const SUMMARISE_SYSTEM_PROMPT = `You are a friendly, concise data analyst for The Mole Clinic (TMC).

You will receive:
- The original question asked by a clinic staff member
- The SQL that was run
- The results as a table (columns + rows)

Your job is to summarise the results in clear, plain English. Be concise but informative.
- Lead with the key number or insight
- Use bullet points if there are multiple items
- Round large numbers sensibly (e.g. £12,450 not £12449.87)
- If results are empty, say so clearly
- Don't explain the SQL, just answer the question
- Keep your response under 150 words unless the data warrants more`;
