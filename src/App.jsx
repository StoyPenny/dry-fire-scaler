import React, { useState, useMemo } from 'react';
import { Target, Ruler, ArrowLeftRight, Settings, Info, Crosshair, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const UNIT_TO_INCHES = {
  in: 1,
  ft: 12,
  yd: 36,
  mm: 0.0393701,
  cm: 0.393701,
  m: 39.3701,
};

const TARGET_PRESETS = [
  { name: 'Custom', width: 0, height: 0 },
  { name: 'IPSC Classic (Full)', width: 18, height: 22.5, unit: 'in' },
  { name: 'IPSC Metric (Full)', width: 18, height: 29.5, unit: 'in' },
  { name: 'USPSA/IPSC (A-Zone)', width: 6, height: 11, unit: 'in' },
  { name: 'IDPA (Body)', width: 18, height: 30, unit: 'in' },
  { name: 'IDPA (Down Zero)', width: 8, height: 8, unit: 'in' },
  { name: 'NRA B-8 (Bullseye)', width: 5.5, height: 5.5, unit: 'in' },
  { name: 'Steel Plate (8")', width: 8, height: 8, unit: 'in' },
  { name: 'Steel Plate (10")', width: 10, height: 10, unit: 'in' },
];

const REVERSE_DISTANCES = [
  { val: 7, unit: 'yd', label: '7 yds' },
  { val: 10, unit: 'yd', label: '10 yds' },
  { val: 15, unit: 'yd', label: '15 yds' },
  { val: 25, unit: 'yd', label: '25 yds' },
  { val: 50, unit: 'yd', label: '50 yds' },
  { val: 100, unit: 'yd', label: '100 yds' },
  { val: 200, unit: 'yd', label: '200 yds' },
  { val: 300, unit: 'yd', label: '300 yds' },
];

export default function App() {
  // --- State ---
  const [mode, setMode] = useState('down'); // 'down' = Real -> Dry, 'up' = Dry -> Real

  // Shared State (Dry Fire Environment)
  const [simDist, setSimDist] = useState(10);
  const [simDistUnit, setSimDistUnit] = useState('ft');

  // Mode: Scale Down (Real -> Dry)
  const [realDist, setRealDist] = useState(25);
  const [realDistUnit, setRealDistUnit] = useState('yd');
  const [selectedPreset, setSelectedPreset] = useState('Custom');
  const [targetWidth, setTargetWidth] = useState(18);
  const [targetHeight, setTargetHeight] = useState(24);
  const [targetUnit, setTargetUnit] = useState('in');

  // Mode: Scale Up (Dry -> Real)
  const [dfTargetWidth, setDfTargetWidth] = useState(1);
  const [dfTargetHeight, setDfTargetHeight] = useState(1);
  const [dfTargetUnit, setDfTargetUnit] = useState('in');

  // --- Calculations ---

  const convertToInches = (val, unit) => val * (UNIT_TO_INCHES[unit] || 1);

  // Helper for MOA
  const calcMoa = (sizeIn, distIn) => {
    if (distIn === 0) return 0;
    const degrees = 2 * Math.atan((sizeIn / 2) / distIn) * (180 / Math.PI);
    return degrees * 60;
  };

  // Logic for Scale Down (Original)
  const calculateDown = useMemo(() => {
    const rDistIn = convertToInches(realDist, realDistUnit);
    const sDistIn = convertToInches(simDist, simDistUnit);
    
    if (rDistIn === 0) return { width: 0, height: 0, scale: 0, moa: 0 };

    const scaleFactor = sDistIn / rDistIn;
    const realWidthIn = convertToInches(targetWidth, targetUnit);
    const realHeightIn = convertToInches(targetHeight, targetUnit);

    return {
      width: realWidthIn * scaleFactor,
      height: realHeightIn * scaleFactor,
      scale: scaleFactor,
      moa: calcMoa(realWidthIn, rDistIn)
    };
  }, [realDist, realDistUnit, simDist, simDistUnit, targetWidth, targetHeight, targetUnit]);

  // Logic for Scale Up (Reverse)
  const calculateUp = useMemo(() => {
    const sDistIn = convertToInches(simDist, simDistUnit);
    const dfWIn = convertToInches(dfTargetWidth, dfTargetUnit);
    const dfHIn = convertToInches(dfTargetHeight, dfTargetUnit);

    if (sDistIn === 0) return { moa: 0, projections: [] };

    // Calculate MOA of the dry fire target setup
    const moa = calcMoa(dfWIn, sDistIn);

    // Calculate equivalent sizes at standard distances
    const projections = REVERSE_DISTANCES.map(d => {
      const dIn = convertToInches(d.val, d.unit);
      // Formula: RealSize = (SimSize * RealDist) / SimDist
      const eqW = (dfWIn * dIn) / sDistIn;
      const eqH = (dfHIn * dIn) / sDistIn;
      return {
        label: d.label,
        width: eqW,
        height: eqH
      };
    });

    return { moa, projections };
  }, [simDist, simDistUnit, dfTargetWidth, dfTargetHeight, dfTargetUnit]);

  // --- Handlers ---

  const handlePresetChange = (e) => {
    const presetName = e.target.value;
    setSelectedPreset(presetName);
    const preset = TARGET_PRESETS.find(p => p.name === presetName);
    if (preset && preset.name !== 'Custom') {
      setTargetWidth(preset.width);
      setTargetHeight(preset.height);
      setTargetUnit(preset.unit);
    }
  };

  // --- Components ---

  const UnitSelect = ({ value, onChange, options = ['in', 'ft', 'yd', 'm', 'cm', 'mm'] }) => (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-100 border-none text-slate-700 text-sm rounded-r-lg focus:ring-2 focus:ring-blue-500 font-medium px-2 py-2 cursor-pointer outline-none"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-md lg:max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crosshair className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold tracking-tight">DryFire<span className="text-slate-400 font-light">Scaler</span></h1>
          </div>
          <div className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300">
            v1.2
          </div>
        </div>
      </header>

      {/* Main Container - Updated for Desktop Layout */}
      <main className="max-w-md lg:max-w-6xl mx-auto p-4 space-y-6">
        
        {/* Mode Switcher */}
        <div className="bg-slate-200 p-1 rounded-xl flex shadow-inner max-w-md mx-auto lg:mx-0 lg:w-full lg:max-w-none">
          <button 
            onClick={() => setMode('down')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${mode === 'down' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Scale Down</span>
          </button>
          <button 
            onClick={() => setMode('up')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${mode === 'up' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Scale Up</span>
          </button>
        </div>

        {/* Responsive Grid Layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real World Scenario (Only for Scale Down) - Placed Top Left */}
            {mode === 'down' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-slate-700">Real World Scenario</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Target Preset */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Type</label>
                    <div className="relative">
                      <select 
                        value={selectedPreset}
                        onChange={handlePresetChange}
                        className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                      >
                        {TARGET_PRESETS.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                        <Settings className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Target Size Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Width</label>
                      <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <input 
                          type="number" 
                          value={targetWidth}
                          onChange={(e) => {
                            setTargetWidth(parseFloat(e.target.value) || 0);
                            setSelectedPreset('Custom');
                          }}
                          className="w-full p-2 text-slate-900 outline-none"
                        />
                        <UnitSelect value={targetUnit} onChange={setTargetUnit} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Height</label>
                      <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <input 
                          type="number" 
                          value={targetHeight}
                          onChange={(e) => {
                            setTargetHeight(parseFloat(e.target.value) || 0);
                            setSelectedPreset('Custom');
                          }}
                          className="w-full p-2 text-slate-900 outline-none"
                        />
                        <div className="bg-slate-100 px-3 py-2 text-sm text-slate-500 border-l border-slate-200">
                          {targetUnit}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real Distance Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Range Distance</label>
                    <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                      <input 
                        type="number" 
                        value={realDist}
                        onChange={(e) => setRealDist(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 text-slate-900 outline-none"
                      />
                      <UnitSelect value={realDistUnit} onChange={setRealDistUnit} options={['yd', 'm', 'ft']} />
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400 flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>Target angular size: <strong className="text-slate-600">{calculateDown.moa.toFixed(1)} MOA</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Dry Fire Environment - Always in Left Column */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                <Ruler className={`w-5 h-5 ${mode === 'down' ? 'text-emerald-600' : 'text-purple-600'}`} />
                <h2 className="font-semibold text-slate-700">Dry Fire Environment</h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Distance to Wall</label>
                    <div className={`flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 ${mode === 'down' ? 'focus-within:ring-emerald-500' : 'focus-within:ring-purple-500'} focus-within:border-transparent`}>
                      <input 
                        type="number" 
                        value={simDist}
                        onChange={(e) => setSimDist(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 text-slate-900 outline-none"
                      />
                      <UnitSelect value={simDistUnit} onChange={setSimDistUnit} options={['ft', 'm', 'yd', 'in']} />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Distance from your standing position to the target on the wall.
                    </p>
                </div>

                {/* If in Scale UP mode, we input the Dry Fire Target Size here */}
                {mode === 'up' && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Width</label>
                          <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                            <input 
                              type="number" 
                              value={dfTargetWidth}
                              onChange={(e) => setDfTargetWidth(parseFloat(e.target.value) || 0)}
                              className="w-full p-2 text-slate-900 outline-none"
                            />
                            <UnitSelect value={dfTargetUnit} onChange={setDfTargetUnit} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Height</label>
                          <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                            <input 
                              type="number" 
                              value={dfTargetHeight}
                              onChange={(e) => setDfTargetHeight(parseFloat(e.target.value) || 0)}
                              className="w-full p-2 text-slate-900 outline-none"
                            />
                            <div className="bg-slate-100 px-3 py-2 text-sm text-slate-500 border-l border-slate-200">
                              {dfTargetUnit}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1 mt-3">
                        <Info className="w-3 h-3" />
                        <span>This setup represents <strong className="text-slate-600">{calculateUp.moa.toFixed(1)} MOA</strong></span>
                      </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: OUTPUTS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SCALE DOWN OUTPUTS */}
            {mode === 'down' && (
              <>
                <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ArrowLeftRight className="w-24 h-24" />
                  </div>
                  
                  <div className="p-6 relative z-10">
                    <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wide mb-4">Required Scaled Dimensions</h3>
                    
                    <div className="flex items-end space-x-4 mb-6">
                      <div>
                        <div className="text-4xl font-bold text-emerald-400 leading-none">
                          {calculateDown.width.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Width (in)</div>
                      </div>
                      <div className="text-2xl text-slate-600 font-light mb-4">×</div>
                      <div>
                        <div className="text-4xl font-bold text-emerald-400 leading-none">
                          {calculateDown.height.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Height (in)</div>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300 flex items-center space-x-3">
                      <FileText className="w-5 h-5 flex-shrink-0" />
                      <span>
                        This represents <strong>{(calculateDown.scale * 100).toFixed(1)}%</strong> of the actual size.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4 w-full text-center">Print Preview (US Letter Paper)</h3>
                    
                    <div 
                      className="relative bg-white shadow-xl border border-slate-200 mb-4 transition-all duration-300"
                      style={{
                        width: '170px',
                        height: '220px',
                      }}
                    >
                      <div className="absolute inset-0 opacity-10" 
                            style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                      </div>

                      <div 
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 flex items-center justify-center text-white text-[10px] shadow-sm transition-all duration-300"
                          style={{
                            width: `${calculateDown.width * 20}px`,
                            height: `${calculateDown.height * 20}px`,
                            maxWidth: '100%', 
                            maxHeight: '100%'
                          }}
                      >
                        {calculateDown.width < 1.5 ? '' : 'Target'}
                      </div>
                    </div>
                    
                    <p className="text-xs text-center text-slate-400 max-w-xs">
                      The white box represents a standard 8.5" x 11" sheet of paper.
                    </p>
                </div>
              </>
            )}

            {/* SCALE UP OUTPUTS */}
            {mode === 'up' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h2 className="font-semibold text-slate-700">Equivalent Real World Sizes</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Distance</th>
                          <th className="px-4 py-3">Equiv. W x H</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {calculateUp.projections.map((proj, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{proj.label}</td>
                            <td className="px-4 py-3 font-mono text-purple-700">
                              {proj.width.toFixed(1)}" × {proj.height.toFixed(1)}"
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500 text-center">
                        A <strong>{dfTargetWidth}{dfTargetUnit}</strong> target at <strong>{simDist}{simDistUnit}</strong> looks the same as these targets at the given distances.
                    </p>
                  </div>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}