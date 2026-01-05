
import React, { useMemo, useState } from 'react';
import { SurveyResponse, AIAnalysis } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { Sparkles, TrendingUp, Activity, Lightbulb, RefreshCw, Download, UserCheck } from 'lucide-react';
import { analyzeSurveyData } from '../services/geminiService';

interface DashboardProps {
  responses: SurveyResponse[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ responses }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const stats = useMemo(() => {
    if (responses.length === 0) return null;

    // Fix: Explicitly type the accumulator as Record<string, number> to prevent arithmetic errors
    const deptCounts = responses.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {});

    const deptData = Object.keys(deptCounts).map(name => ({
      name,
      value: deptCounts[name]
    }));

    // Fix: Provide explicit type for acc in reduce to ensure it is recognized as a number for the division operation
    const radarData = [
      { subject: '自信心', A: responses.reduce((acc: number, curr) => acc + curr.confidenceLevel, 0) / responses.length, fullMark: 5 },
      { subject: '器材滿意', A: responses.reduce((acc: number, curr) => acc + curr.equipmentQuality, 0) / responses.length, fullMark: 5 },
      { subject: '成功率', A: responses.reduce((acc: number, curr) => acc + curr.techniqueRating, 0) / responses.length, fullMark: 5 },
      { subject: '痛控', A: responses.reduce((acc: number, curr) => acc + curr.painManagement, 0) / responses.length, fullMark: 5 },
      { subject: '配合度', A: responses.reduce((acc: number, curr) => acc + curr.patientCooperation, 0) / responses.length, fullMark: 5 },
    ];

    // Fix: Use generic type parameter for reduce
    const siteSuccess = responses.reduce<Record<string, number>>((acc, curr) => {
      const prev = Number(acc[curr.injectionSite] || 0);
      acc[curr.injectionSite] = prev + curr.techniqueRating;
      return acc;
    }, {});

    const siteData = Object.entries(siteSuccess).map(([name, total]) => ({
      name,
      avg: (total as number) / responses.filter(r => r.injectionSite === name).length
    }));

    // Fix: Use generic type parameter for reduce to ensure result is typed correctly
    const challengeFrequency = responses.reduce<Record<string, number>>((acc, curr) => {
      curr.topChallenges.forEach(c => {
        const prevCount = Number(acc[c] || 0);
        acc[c] = prevCount + 1;
      });
      return acc;
    }, {});

    const challengeData = Object.entries(challengeFrequency)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);

    return {
      total: responses.length,
      deptData,
      radarData,
      challengeData,
      siteData,
      // Fix: Explicitly type accumulator as number for the division operation at line 63
      avgConfidence: responses.reduce((acc: number, curr) => acc + curr.confidenceLevel, 0) / responses.length
    };
  }, [responses]);

  const handleRunAI = async () => {
    setLoadingAI(true);
    try {
      const result = await analyzeSurveyData(responses);
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "時間", "單位", "年資", "推薦人", "病患族群", "部位", "針頭", "自信度", "成功率", "困難", "回饋"];
    const rows = responses.map(r => [
      r.id,
      r.timestamp,
      r.department,
      r.experienceYears,
      r.recommender || "無",
      r.patientAgeGroup,
      r.injectionSite,
      r.needleSize,
      r.confidenceLevel,
      r.techniqueRating,
      r.topChallenges.join('|'),
      r.feedbackText.replace(/\n/g, ' ')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `IV_Care_Feedback_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!stats) return <div className="text-center py-20 text-gray-500">尚無數據。</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">總回饋數</p>
          <p className="text-3xl font-black text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">平均自信度</p>
          <p className="text-3xl font-black text-green-600">{stats.avgConfidence.toFixed(1)} <span className="text-sm font-normal text-gray-400">/ 5</span></p>
        </div>
        <div className="col-span-1 md:col-span-2 flex gap-3">
          <button
            onClick={handleRunAI}
            disabled={loadingAI}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loadingAI ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            AI 臨床瓶頸診斷
          </button>
          <button
            onClick={exportToCSV}
            className="px-6 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 flex items-center justify-center transition-all"
            title="匯出 CSV"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border col-span-1">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> 核心表現維度
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={stats.radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar name="表現" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border col-span-1">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" /> 各部位平均成功率評分
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.siteData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis dataKey="name" type="category" fontSize={10} width={60} />
                <Tooltip />
                <Bar dataKey="avg" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-sm border border-blue-100 col-span-1 lg:col-span-1">
          <h3 className="text-sm font-bold text-indigo-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI 臨床改進洞察
          </h3>
          {loadingAI ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs text-blue-600 font-medium">Gemini 正在深度研析...</p>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed bg-white/80 p-3 rounded-lg border border-blue-50">{aiAnalysis.summary}</p>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">關鍵瓶頸</p>
                <div className="flex flex-wrap gap-1">
                  {aiAnalysis.keyIssues.map((issue, i) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] border border-red-100">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">建議方案</p>
                <ul className="space-y-1">
                  {aiAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-[11px] text-green-700 bg-green-50/50 p-2 rounded flex gap-2">
                      <span className="font-bold">✓</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <Lightbulb className="w-12 h-12 opacity-10 mb-2" />
              <p className="text-xs">點擊按鈕獲取診斷</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-800">臨床執行明細</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">時間</th>
                <th className="px-6 py-4">單位</th>
                <th className="px-6 py-4">推薦人</th>
                <th className="px-6 py-4">病患/部位/針頭</th>
                <th className="px-6 py-4 text-center">自信</th>
                <th className="px-6 py-4">挑戰</th>
                <th className="px-6 py-4">臨床心得</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {responses.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400">{new Date(r.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{r.department}</td>
                  <td className="px-6 py-4">
                    {r.recommender ? (
                      <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                        <UserCheck className="w-3 h-3" />
                        <span>{r.recommender}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 italic">無</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{r.patientAgeGroup}</span>
                      <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{r.injectionSite}</span>
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{r.needleSize}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block w-6 h-6 rounded-full leading-6 font-bold text-white ${
                      r.confidenceLevel >= 4 ? 'bg-green-500' : r.confidenceLevel >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {r.confidenceLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {r.topChallenges.map((c, i) => (
                        <span key={i} className="text-[10px] text-gray-500 border rounded px-1">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-[200px] italic">
                    {r.feedbackText || '無'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
