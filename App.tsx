
import React, { useState, useEffect } from 'react';
import { Department, SurveyResponse } from './types';
import SurveyForm from './components/SurveyForm';
import Dashboard from './components/Dashboard';
import { ClipboardList, LayoutDashboard, Stethoscope } from 'lucide-react';

const MOCK_DATA: SurveyResponse[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    department: Department.ER,
    experienceYears: 5,
    recommender: '林曉華、陳大明',
    patientAgeGroup: '成人',
    injectionSite: '前臂',
    needleSize: '22G',
    confidenceLevel: 4,
    techniqueRating: 5,
    equipmentQuality: 3,
    patientCooperation: 2,
    painManagement: 4,
    environmentStress: 5,
    topChallenges: ['血管脆弱', '光線不足'],
    feedbackText: '急診室環境嘈雜，有時候很難跟患者進行有效溝通。'
  },
  {
    id: '2',
    timestamp: new Date().toISOString(),
    department: Department.ICU,
    experienceYears: 10,
    recommender: '王小美',
    patientAgeGroup: '成人',
    injectionSite: '手背',
    needleSize: '20G',
    confidenceLevel: 5,
    techniqueRating: 5,
    equipmentQuality: 4,
    patientCooperation: 5,
    painManagement: 5,
    environmentStress: 2,
    topChallenges: ['患者水腫'],
    feedbackText: '重症患者的血管通常非常具挑戰性。'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard'>('survey');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('iv_survey_responses');
    if (saved) {
      setResponses(JSON.parse(saved));
    } else {
      setResponses(MOCK_DATA);
    }
  }, []);

  const handleSurveySubmit = (newResponse: SurveyResponse) => {
    const updated = [newResponse, ...responses];
    setResponses(updated);
    localStorage.setItem('iv_survey_responses', JSON.stringify(updated));
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight">IV-Care 臨床回饋系統</h1>
          </div>
          <nav className="flex space-x-1 bg-blue-700 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('survey')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'survey' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-blue-600'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="text-sm font-medium">填寫問卷</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-blue-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">統計儀表板</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
        {activeTab === 'survey' ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800">靜脈注射執行回饋</h2>
              <p className="text-gray-600 mt-2">您的回饋將幫助我們優化臨床護理流程與環境</p>
            </div>
            <SurveyForm onSubmit={handleSurveySubmit} />
          </div>
        ) : (
          <Dashboard responses={responses} />
        )}
      </main>

      <footer className="bg-gray-100 border-t py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© 2024 IV-Care 臨床教學中心 | 專業、安全、品質</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
