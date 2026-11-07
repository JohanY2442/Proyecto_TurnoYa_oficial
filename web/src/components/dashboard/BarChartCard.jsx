import PropTypes from 'prop-types';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../ui/Card';

function ChartTooltip({ active, payload, unidad }) {
  if (!active || !payload?.length) return null;
  const { label, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-sm">
      <p className="font-bold">{label}</p>
      <p className="text-ink-soft">
        {value} {unidad}
      </p>
    </div>
  );
}

ChartTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array, unidad: PropTypes.string };

/**
 * Gráfico de barras de una sola serie (sin leyenda: el título la nombra).
 * Cada barra puede traer su propio color cuando el color tiene significado (urgencia).
 * Debajo hay una tabla con los mismos datos para lectores de pantalla o impresión.
 */
export default function BarChartCard({ title, data, unidad = 'turnos', horizontal = false, height = 240 }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const ejeTexto = { fill: 'var(--ink-soft)', fontSize: 13 };

  return (
    <Card>
      <h2 className="text-lg font-bold">{title}</h2>
      {total === 0 ? (
        <p className="mt-3 text-ink-soft">Sin datos para este día.</p>
      ) : (
        <div style={{ height }} className="mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout={horizontal ? 'vertical' : 'horizontal'}
              margin={{ top: 20, right: horizontal ? 32 : 8, left: horizontal ? 8 : -16, bottom: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid stroke="var(--line)" strokeDasharray="0" vertical={horizontal} horizontal={!horizontal} />
              {horizontal ? (
                <>
                  <XAxis type="number" allowDecimals={false} tick={ejeTexto} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" tick={ejeTexto} axisLine={false} tickLine={false} width={130} />
                </>
              ) : (
                <>
                  <XAxis dataKey="label" tick={ejeTexto} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={ejeTexto} axisLine={false} tickLine={false} />
                </>
              )}
              <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip unidad={unidad} />} />
              <Bar dataKey="value" animationDuration={450} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={horizontal ? 22 : 44} stroke="var(--surface)" strokeWidth={2}>
                {data.map((d) => (
                  <Cell key={d.label} fill={d.color ?? 'var(--brand)'} />
                ))}
                <LabelList dataKey="value" position={horizontal ? 'right' : 'top'} fill="var(--ink)" fontSize={13} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-ink-soft hover:text-ink">Ver como tabla</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="py-1 font-bold">Categoría</th>
              <th className="py-1 text-right font-bold">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-b border-line/60">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right tabular-nums">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  );
}

BarChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.number.isRequired, color: PropTypes.string })).isRequired,
  unidad: PropTypes.string,
  horizontal: PropTypes.bool,
  height: PropTypes.number,
};
