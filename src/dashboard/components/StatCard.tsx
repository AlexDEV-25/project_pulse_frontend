type Props = {
  label: string;
  value: string | number;
  note?: string;
  tone?: 'normal' | 'danger';
};
export default function StatCard({
  label,
  value,
  note,
  tone = 'normal',
}: Props) {
  return (
    <article className={`dash-stat-card ${tone}`}>
      <h2>{label}</h2>
      <strong>{value}</strong>
      {note && <p>{note}</p>}
    </article>
  );
}
