// src/AttributeRadar.jsx
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

function AttributeRadar({ attributes }) {
  const data = [
    { stat: "Remate", value: attributes?.remate ?? 0 },
    { stat: "Passe", value: attributes?.passe ?? 0 },
    { stat: "Drible", value: attributes?.drible ?? 0 },
    { stat: "Velocidade", value: attributes?.velocidade ?? 0 },
    { stat: "Resistência", value: attributes?.resistencia ?? 0 },
    { stat: "Compostura", value: attributes?.compostura ?? 0 }
  ];

  // garante que o raio chega pelo menos até 10
  const maxValue = Math.max(...data.map((d) => d.value), 10);

  return (
    <div className="radar-card">
      <h3>Atributos principais</h3>
      <div className="radar-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#4b5563" />
            <PolarAngleAxis
              dataKey="stat"
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxValue]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Atributos"
              dataKey="value"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AttributeRadar;
