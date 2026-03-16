/**
 * Mock query results for development — no Fabric connection required.
 * Keyed by normalised query fingerprints.
 */

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
  mockSql: string;
  answer: string;
};

function matchesQuery(question: string, keywords: string[]): boolean {
  const q = question.toLowerCase();
  return keywords.every((k) => q.includes(k.toLowerCase()));
}

export function getMockResult(question: string, clinic: string | null): QueryResult | null {
  const q = question.toLowerCase();

  // Wilmslow week comparison
  if (
    (q.includes("wilmslow") || clinic?.toLowerCase() === "wilmslow") &&
    (q.includes("week") || q.includes("perform"))
  ) {
    return {
      columns: ["Metric", "Last Week", "This Week", "Change", "Change %"],
      rows: [
        ["Total Appointments", 187, 201, "+14", "+7.5%"],
        ["Attended", 164, 178, "+14", "+8.5%"],
        ["Cancelled", 18, 16, "-2", "-11.1%"],
        ["No-Show", 5, 7, "+2", "+40.0%"],
        ["Revenue (Paid)", "£28,430", "£31,205", "+£2,775", "+9.8%"],
        ["Avg Invoice Value", "£173.36", "£175.31", "+£1.95", "+1.1%"],
        ["New Patients", 34, 41, "+7", "+20.6%"],
      ],
      mockSql: `-- Wilmslow: This week vs last week comparison
WITH this_week AS (
    SELECT
        COUNT(*) AS total_appts,
        SUM(CASE WHEN fa.status = 'Attended' THEN 1 ELSE 0 END) AS attended,
        SUM(CASE WHEN fa.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN fa.status = 'No-Show' THEN 1 ELSE 0 END) AS no_show,
        SUM(fi.net_amount) AS revenue
    FROM fact_appointments fa WITH (NOLOCK)
    JOIN dim_clinics dc ON fa.clinic_id = dc.clinic_id
    LEFT JOIN fact_invoices fi ON fa.appointment_id = fi.appointment_id AND fi.payment_status = 'Paid'
    WHERE dc.clinic_name = 'Wilmslow'
      AND DATEPART(ISO_WEEK, fa.appointment_date) = DATEPART(ISO_WEEK, GETDATE())
      AND YEAR(fa.appointment_date) = YEAR(GETDATE())
),
last_week AS (
    SELECT
        COUNT(*) AS total_appts,
        SUM(CASE WHEN fa.status = 'Attended' THEN 1 ELSE 0 END) AS attended,
        SUM(CASE WHEN fa.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN fa.status = 'No-Show' THEN 1 ELSE 0 END) AS no_show,
        SUM(fi.net_amount) AS revenue
    FROM fact_appointments fa WITH (NOLOCK)
    JOIN dim_clinics dc ON fa.clinic_id = dc.clinic_id
    LEFT JOIN fact_invoices fi ON fa.appointment_id = fi.appointment_id AND fi.payment_status = 'Paid'
    WHERE dc.clinic_name = 'Wilmslow'
      AND DATEPART(ISO_WEEK, fa.appointment_date) = DATEPART(ISO_WEEK, GETDATE()) - 1
      AND YEAR(fa.appointment_date) = YEAR(GETDATE())
)
SELECT * FROM this_week, last_week;`,
      answer:
        "Wilmslow is performing well this week. Appointments are up 7.5% (187 → 201) and revenue has grown 9.8% to **£31,205**. Cancellations dropped slightly (18 → 16), and new patient numbers jumped 20.6% — a strong sign of growth. The no-show rate ticked up slightly to 7, worth monitoring.",
    };
  }

  // Cancellation rate by clinic
  if (matchesQuery(q, ["cancellation", "clinic"])) {
    return {
      columns: ["Clinic", "Total Appointments", "Cancellations", "Cancellation Rate"],
      rows: [
        ["Wilmslow", 834, 72, "8.6%"],
        ["London Harley St", 612, 48, "7.8%"],
        ["London City", 589, 53, "9.0%"],
        ["Birmingham", 471, 52, "11.0%"],
        ["Manchester", 508, 41, "8.1%"],
        ["Leeds", 392, 38, "9.7%"],
        ["Bristol", 344, 34, "9.9%"],
        ["Edinburgh", 287, 22, "7.7%"],
      ],
      mockSql: `-- Cancellation rate by clinic this month
SELECT
    dc.clinic_name AS [Clinic],
    COUNT(*) AS [Total Appointments],
    SUM(CASE WHEN fa.status = 'Cancelled' THEN 1 ELSE 0 END) AS [Cancellations],
    FORMAT(
        SUM(CASE WHEN fa.status = 'Cancelled' THEN 1.0 ELSE 0 END) / COUNT(*) * 100,
        'N1'
    ) + '%' AS [Cancellation Rate]
FROM fact_appointments fa WITH (NOLOCK)
JOIN dim_clinics dc ON fa.clinic_id = dc.clinic_id
WHERE fa.appointment_date >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)
  AND fa.appointment_date < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)
GROUP BY dc.clinic_name
ORDER BY [Cancellation Rate] DESC;`,
      answer:
        "Cancellation rates this month range from **7.7% (Edinburgh)** to **11.0% (Birmingham)**. Birmingham is the outlier and worth investigating — the network average sits around 9%. London Harley St and Edinburgh are performing best for attendance reliability.",
    };
  }

  // Top clinics by revenue
  if (
    (q.includes("revenue") || q.includes("top")) &&
    (q.includes("clinic") || q.includes("clinics"))
  ) {
    return {
      columns: ["Rank", "Clinic", "Revenue", "Appointments", "Avg Invoice"],
      rows: [
        [1, "London Harley St", "£142,380", 612, "£232.65"],
        [2, "Wilmslow", "£138,920", 834, "£166.57"],
        [3, "London City", "£121,450", 589, "£206.03"],
        [4, "Manchester", "£89,340", 508, "£175.87"],
        [5, "Birmingham", "£74,120", 471, "£157.37"],
        [6, "Leeds", "£68,890", 392, "£175.74"],
        [7, "Bristol", "£58,230", 344, "£169.27"],
        [8, "Edinburgh", "£52,140", 287, "£181.67"],
      ],
      mockSql: `-- Top clinics by revenue Q1
SELECT
    RANK() OVER (ORDER BY SUM(fi.net_amount) DESC) AS [Rank],
    dc.clinic_name AS [Clinic],
    FORMAT(SUM(fi.net_amount), 'C0', 'en-GB') AS [Revenue],
    COUNT(DISTINCT fa.appointment_id) AS [Appointments],
    FORMAT(SUM(fi.net_amount) / COUNT(DISTINCT fi.invoice_id), 'C2', 'en-GB') AS [Avg Invoice]
FROM fact_invoices fi WITH (NOLOCK)
JOIN dim_clinics dc ON fi.clinic_id = dc.clinic_id
JOIN fact_appointments fa ON fi.appointment_id = fa.appointment_id
WHERE fi.payment_status = 'Paid'
  AND fi.invoice_date >= '2025-01-01'
  AND fi.invoice_date < '2025-04-01'
GROUP BY dc.clinic_name
ORDER BY SUM(fi.net_amount) DESC;`,
      answer:
        "London Harley St leads Q1 revenue at **£142,380**, closely followed by Wilmslow at **£138,920**. London City rounds out the top three at **£121,450**. Notably, Harley St has the highest average invoice (£232) despite fewer appointments than Wilmslow, reflecting its premium service mix. Edinburgh and Bristol have the smallest volumes but Edinburgh shows a strong avg invoice of £181.",
    };
  }

  // Practitioners / appointments
  if (q.includes("practitioner") || q.includes("doctor")) {
    return {
      columns: ["Practitioner", "Clinic", "Role", "Appointments", "Attended", "Attended %"],
      rows: [
        ["Dr. Sarah Chen", "London Harley St", "Dermatologist", 198, 182, "91.9%"],
        ["Dr. James Okafor", "Wilmslow", "Dermatologist", 211, 189, "89.6%"],
        ["Dr. Priya Patel", "Manchester", "Dermatologist", 176, 159, "90.3%"],
        ["Nurse Emma Walsh", "Birmingham", "Nurse", 243, 214, "88.1%"],
        ["Dr. Callum Ross", "Edinburgh", "Dermatologist", 134, 124, "92.5%"],
      ],
      mockSql: `-- Practitioners by appointments
SELECT TOP 10
    dp.full_name AS [Practitioner],
    dc.clinic_name AS [Clinic],
    dp.role AS [Role],
    COUNT(*) AS [Appointments],
    SUM(CASE WHEN fa.status = 'Attended' THEN 1 ELSE 0 END) AS [Attended],
    FORMAT(
        SUM(CASE WHEN fa.status = 'Attended' THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 'N1'
    ) + '%' AS [Attended %]
FROM fact_appointments fa WITH (NOLOCK)
JOIN dim_practitioners dp ON fa.practitioner_id = dp.practitioner_id
JOIN dim_clinics dc ON fa.clinic_id = dc.clinic_id
WHERE MONTH(fa.appointment_date) = 2
  AND YEAR(fa.appointment_date) = YEAR(GETDATE())
GROUP BY dp.full_name, dc.clinic_name, dp.role
ORDER BY COUNT(*) DESC;`,
      answer:
        "Nurse Emma Walsh (Birmingham) led with **243 appointments** in February, while Dr. James Okafor at Wilmslow had the highest dermatologist count at 211. Attendance rates are consistently strong — Dr. Callum Ross in Edinburgh topped the group at **92.5%** attended.",
    };
  }

  return null;
}
