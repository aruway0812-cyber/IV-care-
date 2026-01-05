
import React, { useState } from 'react';
import { Department, SurveyResponse, PatientAgeGroup, InjectionSite, NeedleSize } from '../types';
import { Send, User, MapPin, Gauge, Activity, Package, UserX, AlertCircle, Syringe, Users, UserPlus } from 'lucide-react';

interface SurveyFormProps {
  onSubmit: (response: SurveyResponse) => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    department: Department.GENERAL,
    experienceYears: 0,
    recommender: '',
    patientAgeGroup: '成人' as PatientAgeGroup,
    injectionSite: '前臂' as InjectionSite,
    needleSize: '22G' as NeedleSize,
    confidenceLevel: 3,
    techniqueRating: 3,
    equipmentQuality: 3,
    patientCooperation: 3,
    painManagement: 3,
    environmentStress: 3,
    topChallenges: [] as string[],
    feedbackText: ''
  });

  const challengesOptions = [
    '血管脆弱/過細',
    '患者極度不配合',
    '光線不足',
    '設備短缺/品質不良',
    '時間壓力緊迫',
    '水腫導致定位困難',
    '反覆置管困難',
    '穿刺點選擇受限'
  ];

  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      topChallenges: prev.topChallenges.includes(challenge)
        ? prev.topChallenges.filter(c => c !== challenge)
        : [...prev.topChallenges, challenge]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResponse: SurveyResponse = {
      ...formData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    onSubmit(newResponse);
  };

  const RatingField = ({ label, name, icon: Icon }: { label: string, name: keyof typeof formData, icon: any }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-gray-700 font-medium">
        <Icon className="w-4 h-4 text-blue-500" />
        <label className="text-sm">{label}</label>
      </div>
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setFormData(p => ({ ...p, [name]: val }))}
            className={`w-9 h-9 rounded-full transition-all text-xs font-bold border ${
              formData[name as keyof typeof formData] === val
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300'
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8 border border-gray-100 max-w-4xl mx-auto">
      {/* Basic & Clinical Info */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-600 pl-3 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> 基本資訊
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">所屬單位</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(p => ({ ...p, department: e.target.value as Department }))}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                >
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">臨床年資</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData(p => ({ ...p, experienceYears: parseInt(e.target.value) || 0 }))}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">
                推薦人 <span className="text-red-500 normal-case">(限 2 人)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.recommender}
                  onChange={(e) => setFormData(p => ({ ...p, recommender: e.target.value }))}
                  placeholder="請輸入推薦人姓名..."
                  className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                />
                <UserPlus className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-indigo-600 pl-3 flex items-center gap-2">
            <Syringe className="w-5 h-5 text-indigo-600" /> 執行細節
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">病患族群</label>
                <select
                  value={formData.patientAgeGroup}
                  onChange={(e) => setFormData(p => ({ ...p, patientAgeGroup: e.target.value as PatientAgeGroup }))}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                >
                  <option value="新生兒">新生兒</option>
                  <option value="兒童">兒童</option>
                  <option value="成人">成人</option>
                  <option value="高齡者">高齡者</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">針頭規格</label>
                <select
                  value={formData.needleSize}
                  onChange={(e) => setFormData(p => ({ ...p, needleSize: e.target.value as NeedleSize }))}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                >
                  <option value="18G">18G</option>
                  <option value="20G">20G</option>
                  <option value="22G">22G</option>
                  <option value="24G">24G</option>
                  <option value="Safety Needle">安全針</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">注射部位</label>
              <select
                value={formData.injectionSite}
                onChange={(e) => setFormData(p => ({ ...p, injectionSite: e.target.value as InjectionSite }))}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
              >
                <option value="手背">手背 (Dorsum of Hand)</option>
                <option value="前臂">前臂 (Forearm)</option>
                <option value="肘窩 (ACF)">肘窩 (ACF)</option>
                <option value="足部">足部 (Foot)</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Ratings Section */}
      <section className="space-y-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-blue-600" /> 臨床執行評分
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <RatingField label="操作自信心" name="confidenceLevel" icon={Gauge} />
          <RatingField label="置管成功率" name="techniqueRating" icon={Activity} />
          <RatingField label="耗材品質滿意" name="equipmentQuality" icon={Package} />
          <RatingField label="疼痛管理成效" name="painManagement" icon={Activity} />
          <RatingField label="病患配合度" name="patientCooperation" icon={Users} />
          <RatingField label="環境壓力影響" name="environmentStress" icon={AlertCircle} />
        </div>
      </section>

      {/* Challenges Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">主要臨床挑戰 (可複選)</h3>
        <div className="flex flex-wrap gap-2">
          {challengesOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChallengeToggle(option)}
              className={`px-4 py-2 rounded-xl text-xs border transition-all ${
                formData.topChallenges.includes(option)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">具體改進建議或心得</h3>
        <textarea
          rows={3}
          value={formData.feedbackText}
          onChange={(e) => setFormData(p => ({ ...p, feedbackText: e.target.value }))}
          placeholder="例如：特定病房的光線太暗、某廠牌留置針容易彈開等..."
          className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
        />
      </section>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transform transition-all active:scale-[0.98] shadow-xl flex items-center justify-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>送出臨床回饋</span>
        </button>
      </div>
    </form>
  );
};

export default SurveyForm;
