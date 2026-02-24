import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

// --- DATA ---
type Size = 'Full' | 'Queen' | 'King' | 'Split King'
type Base = 'Ease' | 'Ergo 3.0' | 'Ergo Smart' | 'Pro Smart'
type Term = 6 | 12 | 24 | 36 | 48 | 60 | 72

const PAYMENTS_72: Record<Size, Record<Base, number | null>> = {
  Full: { Ease: 15, 'Ergo 3.0': 24, 'Ergo Smart': 31, 'Pro Smart': null },
  Queen: { Ease: 15, 'Ergo 3.0': 24, 'Ergo Smart': 30, 'Pro Smart': 37 },
  King: { Ease: 22, 'Ergo 3.0': 33, 'Ergo Smart': 40, 'Pro Smart': 47 },
  'Split King': { Ease: 26, 'Ergo 3.0': 44, 'Ergo Smart': 58, 'Pro Smart': 72 },
}

const FEATURES: Record<string, Record<Base, boolean>> = {
  'Head & foot elevation': { Ease: true, 'Ergo 3.0': true, 'Ergo Smart': true, 'Pro Smart': true },
  'Preset positions': { Ease: false, 'Ergo 3.0': true, 'Ergo Smart': true, 'Pro Smart': true },
  'Lumbar support': { Ease: false, 'Ergo 3.0': true, 'Ergo Smart': true, 'Pro Smart': true },
  'Basic massage': { Ease: false, 'Ergo 3.0': true, 'Ergo Smart': true, 'Pro Smart': false },
  'Anti-snore response': { Ease: false, 'Ergo 3.0': false, 'Ergo Smart': true, 'Pro Smart': true },
  'Smart sleep alarm': { Ease: false, 'Ergo 3.0': false, 'Ergo Smart': true, 'Pro Smart': true },
  'Vibro-acoustic therapy': { Ease: false, 'Ergo 3.0': false, 'Ergo Smart': false, 'Pro Smart': true },
}

const BENEFITS: Record<Base, string> = {
  Ease: 'Head and foot elevation to help with acid reflux, snoring relief, and back comfort. The most affordable way to sleep at an angle.',
  'Ergo 3.0': 'Adds lumbar support, massage, and programmable position presets. Set your perfect sleep position once and return to it every night.',
  'Ergo Smart': 'Automatically detects snoring and raises your head or activates massage to stop it — without waking you up. Smart alarm wakes you during your lightest sleep stage using gentle vibration instead of a jarring sound.',
  'Pro Smart': 'Vibro-Acoustic Therapy uses sound wave frequency technology clinically shown to reduce headaches, back pain, and neck pain. The most therapeutic sleep experience Tempur-Pedic makes.',
}

const DISRUPTORS = [
  { id: 'snore', label: 'I snore', icon: '😤', mapsTo: 'Anti-snore response' },
  { id: 'partner-snore', label: 'My partner snores', icon: '👫', mapsTo: 'Anti-snore response' },
  { id: 'back-pain', label: 'Back pain', icon: '🔙', mapsTo: 'Vibro-acoustic therapy' },
  { id: 'neck-pain', label: 'Neck pain', icon: '🧣', mapsTo: 'Vibro-acoustic therapy' },
  { id: 'headaches', label: 'Headaches', icon: '🤕', mapsTo: 'Vibro-acoustic therapy' },
  { id: 'reflux', label: 'Acid reflux / GERD', icon: '🔥', mapsTo: 'Head elevation' },
  { id: 'waking', label: 'Trouble waking gently', icon: '⏰', mapsTo: 'Smart sleep alarm' },
  { id: 'positions', label: 'Want to program positions', icon: '📍', mapsTo: 'Preset positions' },
  { id: 'discomfort', label: 'General back discomfort', icon: '💆', mapsTo: 'Lumbar support' },
]

const BASES: Base[] = ['Ease', 'Ergo 3.0', 'Ergo Smart', 'Pro Smart']

function App() {
  const [selectedSize, setSelectedSize] = useState<Size>('Queen')
  const [budgetSlider, setBudgetSlider] = useState(35)
  const [selectedTerm, setSelectedTerm] = useState<Term>(72)
  const [showAllTerms, setShowAllTerms] = useState(false)
  const [checkedDisruptors, setCheckedDisruptors] = useState<string[]>([])
  const [focusedCard, setFocusedCard] = useState<Base | null>(null)

  const retailPrice = (base: Base) => {
    const p72 = PAYMENTS_72[selectedSize][base]
    return p72 ? p72 * 72 : 0
  }

  const monthlyPayment = (base: Base, term: number) => {
    const retail = retailPrice(base)
    return retail / term
  }

  const dailyCost = (base: Base, term: number) => {
    return monthlyPayment(base, term) / 30
  }

  const getMatches = (base: Base) => {
    return checkedDisruptors.filter(d => {
      const disruptor = DISRUPTORS.find(x => x.id === d)
      if (!disruptor) return false
      return Object.entries(FEATURES).some(([feature, bases]) => {
        return bases[base] && feature.toLowerCase().includes(disruptor.mapsTo.toLowerCase().split(' ')[0])
      })
    }).length
  }

  const getBestMatch = (): Base | null => {
    if (checkedDisruptors.length === 0) return null
    let best: Base | null = null
    let bestScore = -1
    BASES.forEach(base => {
      const p72 = PAYMENTS_72[selectedSize][base]
      if (p72 === null) return
      const matches = getMatches(base)
      if (matches > bestScore) {
        bestScore = matches
        best = base
      }
    })
    return best
  }

  const recommendedBase = getBestMatch()
  const p72Recommended = recommendedBase ? PAYMENTS_72[selectedSize][recommendedBase] : null

  const budgetLabel = () => {
    if (budgetSlider <= 20) return 'Great starting point'
    if (budgetSlider <= 35) return 'Most popular range'
    if (budgetSlider <= 55) return 'Premium comfort range'
    return 'Top of the line'
  }

  const dailyLabel = (daily: number) => {
    if (daily < 0.75) return "That's less than a bottle of water per day"
    if (daily < 1.5) return "That's less than a daily coffee"
    if (daily < 2) return "That's about the cost of a daily energy drink"
    return "That's less than a restaurant lunch per day"
  }

  const getInsight = () => {
    const snoring = checkedDisruptors.includes('snore') || checkedDisruptors.includes('partner-snore')
    const pain = checkedDisruptors.some(d => ['back-pain', 'neck-pain', 'headaches'].includes(d))
    
    if (snoring && recommendedBase === 'Ergo Smart' && p72Recommended && p72Recommended <= budgetSlider + 15) {
      const daily = dailyCost('Ergo Smart', 72)
      return `You checked snoring as a concern. The Ergo Smart automatically detects snoring and responds without waking either of you up. At $${monthlyPayment('Ergo Smart', 72).toFixed(0)}/mo, that's $${daily.toFixed(2)} per day to solve a problem that's disrupting both of your sleep every night.`
    }
    
    if (pain && recommendedBase === 'Pro Smart') {
      const painType = checkedDisruptors.includes('back-pain') ? 'back pain' : 
                      checkedDisruptors.includes('neck-pain') ? 'neck pain' : 'headaches'
      return `You checked ${painType}. The Pro Smart is the only adjustable base with Vibro-Acoustic Therapy — sound wave frequency technology specifically shown to reduce ${painType}. It's the only product that addresses that problem directly.`
    }
    
    if (recommendedBase && p72Recommended && p72Recommended <= budgetSlider) {
      const daily = dailyCost(recommendedBase, 72)
      const topDisruptor = DISRUPTORS.find(d => checkedDisruptors.includes(d.id))?.label || 'your concern'
      return `The ${recommendedBase} ${selectedSize} fits your $${budgetSlider}/mo budget and directly addresses ${topDisruptor}. At $${daily.toFixed(2)} per day, that's one of the most cost-effective ways to solve a problem that's already costing the average American $833 every month.`
    }
    
    if (recommendedBase && p72Recommended && p72Recommended <= budgetSlider + 15) {
      const diff = p72Recommended - budgetSlider
      const dailyDiff = diff / 30
      return `The ${recommendedBase} is only $${diff}/mo over your budget — $${dailyDiff.toFixed(2)} more per day — and it's the only base that ${BENEFITS[recommendedBase].split('.')[0].toLowerCase()}. Most customers find that's an easy call.`
    }
    
    const easeDaily = dailyCost('Ease', 72)
    return `The Ease ${selectedSize} gives you head and foot elevation — the single most impactful position change for back comfort, acid reflux, and snoring relief — for $${easeDaily.toFixed(2)} per day.`
  }

  const copySummary = () => {
    const base = focusedCard || recommendedBase || 'Ergo Smart'
    const p72 = PAYMENTS_72[selectedSize][base]
    const retail = retailPrice(base)
    const daily = dailyCost(base, 72)
    const text = `
Tempur-Pedic Base Recommendation

${base} - ${selectedSize}
$${p72}/mo (72 months)
Total: $${retail.toLocaleString()}
Daily: $${daily.toFixed(2)}

Key Features:
${Object.entries(FEATURES).filter(([_, bases]) => bases[base]).map(([f]) => `✓ ${f}`).join('\n')}

See m3rcey.github.io/base-calculator/
    `.trim()
    navigator.clipboard.writeText(text)
    alert('Summary copied to clipboard!')
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans">
      {/* Section 1 - Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          The True Cost of Poor Sleep Might Surprise You
        </h1>
        <p className="text-lg text-[#94a3b8] max-w-2xl mb-8">
          The average American loses <span className="text-[#f59e0b] font-semibold">$6,000–$15,000</span> per year to poor sleep through lost productivity, healthcare costs, bad decision-making, and stimulants like coffee. A Tempur-Pedic adjustable base starts at less than <span className="text-[#f59e0b] font-semibold">$1 a day</span>.
        </p>
        <p className="text-sm text-[#64748b] mb-8">
          Sources: RAND Corporation (2016), Harvard Medical School, Gallup (2022)
        </p>
        <button
          onClick={() => scrollToSection('disruptors')}
          className="px-8 py-4 bg-[#f59e0b] text-[#0f172a] font-bold rounded-lg text-lg hover:bg-[#fbbf24] transition-colors"
        >
          Find My Base →
        </button>
      </section>

      {/* Section 2 - Disruptors */}
      <section id="disruptors" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">What's affecting your sleep?</h2>
        <p className="text-[#94a3b8] mb-8">Check everything that applies — we'll match you to the right base.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DISRUPTORS.map(d => (
            <label key={d.id} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              checkedDisruptors.includes(d.id) ? 'bg-[#1e293b] border-[#f59e0b]' : 'bg-[#1e293b] border-[#334155]'
            }`}>
              <input
                type="checkbox"
                checked={checkedDisruptors.includes(d.id)}
                onChange={() => {
                  setCheckedDisruptors(prev => 
                    prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id]
                  )
                }}
                className="w-5 h-5 accent-[#f59e0b]"
              />
              <span className="text-2xl">{d.icon}</span>
              <span className="flex-1">{d.label}</span>
              <span className="text-xs text-[#64748b] bg-[#0f172a] px-2 py-1 rounded">{d.mapsTo}</span>
            </label>
          ))}
        </div>
        {checkedDisruptors.length > 0 && (
          <p className="mt-6 text-center text-[#22c55e]">
            Based on your selections, the <span className="font-bold">{recommendedBase || '...'}</span> addresses {getMatches(recommendedBase || 'Ergo Smart')} of your {checkedDisruptors.length} concerns.
          </p>
        )}
      </section>

      {/* Section 3 - Budget */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">What's a comfortable monthly payment?</h2>
        <p className="text-[#94a3b8] mb-8">Based on 72-month financing — the lowest available monthly payment.</p>
        <div className="bg-[#1e293b] rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <span className="text-[#94a3b8]">Monthly budget</span>
            <span className="text-[#f59e0b] text-2xl font-bold">${budgetSlider}/mo</span>
          </div>
          <input
            type="range"
            min={15}
            max={80}
            value={budgetSlider}
            onChange={(e) => setBudgetSlider(Number(e.target.value))}
            className="w-full h-3 bg-[#334155] rounded-lg accent-[#f59e0b] mb-4"
          />
          <div className="flex justify-between text-sm text-[#64748b] mb-4">
            <span>$15</span>
            <span>$80</span>
          </div>
          <p className="text-center text-[#f59e0b] font-medium mb-2">{budgetLabel()}</p>
          <p className="text-center text-[#22c55e] text-sm">
            ${(budgetSlider / 30).toFixed(2)}/day — {dailyLabel(budgetSlider / 30)}
          </p>
        </div>
      </section>

      {/* Section 4 - Size Selector */}
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <div className="flex gap-2 flex-wrap justify-center">
          {(['Full', 'Queen', 'King', 'Split King'] as Size[]).map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedSize === size 
                  ? 'bg-[#f59e0b] text-[#0f172a]' 
                  : 'bg-[#1e293b] text-[#94a3b8] border border-[#334155]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {selectedSize === 'Full' && (
          <p className="text-center text-[#64748b] text-sm mt-4">
            Pro Smart is not available in Full size
          </p>
        )}
      </section>

      {/* Section 5 - Base Cards */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Choose Your Base</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BASES.map(base => {
            const p72 = PAYMENTS_72[selectedSize][base]
            const isAvailable = p72 !== null
            const monthly = isAvailable ? monthlyPayment(base, selectedTerm) : 0
            const daily = isAvailable ? dailyCost(base, selectedTerm) : 0
            const matches = getMatches(base)
            const isRecommended = recommendedBase === base
            const withinBudget = p72 && p72 <= budgetSlider
            const slightlyOver = p72 && p72 > budgetSlider && p72 <= budgetSlider + 15
            
            return (
              <div
                key={base}
                onClick={() => setFocusedCard(base)}
                className={`relative bg-[#1e293b] rounded-lg p-5 cursor-pointer transition-all ${
                  !isAvailable ? 'opacity-50' : ''
                } ${
                  withinBudget ? 'border-2 border-[#22c55e]' : 
                  slightlyOver ? 'border-2 border-[#f59e0b]' : 
                  'border border-[#334155]'
                } ${isRecommended ? 'ring-2 ring-[#f59e0b]' : ''}`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-[#0f172a] text-xs font-bold px-3 py-1 rounded-full">
                    Recommended for You
                  </div>
                )}
                {base === 'Ease' && <span className="absolute top-2 right-2 text-xs bg-[#22c55e] text-white px-2 py-1 rounded">Best Value</span>}
                {base === 'Ergo Smart' && <span className="absolute top-2 right-2 text-xs bg-[#f59e0b] text-[#0f172a] px-2 py-1 rounded">Most Popular</span>}
                {base === 'Pro Smart' && <span className="absolute top-2 right-2 text-xs bg-[#f59e0b] text-[#0f172a] px-2 py-1 rounded">Top of Line</span>}
                
                <h3 className="text-xl font-bold mb-2">{base}</h3>
                <p className="text-[#94a3b8] text-sm mb-4 h-20">{BENEFITS[base]}</p>
                
                {isAvailable ? (
                  <>
                    <div className="text-[#f59e0b] text-4xl font-bold">${monthly.toFixed(0)}</div>
                    <p className="text-[#64748b] text-sm mb-1">per month / {selectedTerm} months</p>
                    <p className="text-[#64748b] text-xs mb-2">Total: ${(monthly * selectedTerm).toLocaleString()}</p>
                    <p className="text-[#22c55e] text-sm mb-4">${daily.toFixed(2)}/day</p>
                    
                    {checkedDisruptors.length > 0 && (
                      matches > 0 ? (
                        <p className="text-[#22c55e] text-sm mb-4">✓ Addresses {matches} of your {checkedDisruptors.length} concerns</p>
                      ) : (
                        <p className="text-[#64748b] text-sm mb-4">Does not address your top concerns</p>
                      )
                    )}
                    
                    {withinBudget && <p className="text-[#22c55e] text-xs">Within your budget ✓</p>}
                    {slightlyOver && <p className="text-[#f59e0b] text-xs">Only ${p72 - budgetSlider}/mo more</p>}
                    
                    <div className="mt-4 space-y-1">
                      {Object.entries(FEATURES).map(([feature, bases]) => (
                        <div key={feature} className={`text-xs ${bases[base] ? 'text-[#f8fafc]' : 'text-[#64748b]'}`}>
                          {bases[base] ? '✓' : '✗'} {feature}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-[#64748b] text-center py-8">Not available in {selectedSize}</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Section 6 - Upgrade Path */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">What does each upgrade actually add?</h2>
        <p className="text-[#94a3b8] mb-8">All prices shown for {selectedSize} at {selectedTerm} months</p>
        <div className="space-y-4">
          {BASES.slice(0, -1).map((base, i) => {
            const nextBase = BASES[i + 1]
            const p1 = PAYMENTS_72[selectedSize][base]
            const p2 = PAYMENTS_72[selectedSize][nextBase]
            if (!p1 || !p2) return null
            const diff = p2 - p1
            const dailyDiff = diff / 30
            const upgrades = Object.entries(FEATURES).filter(([_, bases]) => !bases[base] && bases[nextBase]).map(([f]) => f)
            
            return (
              <div key={base} className="bg-[#1e293b] rounded-lg p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="text-center md:text-left">
                  <span className="font-bold">{base}</span>
                  <span className="text-[#94a3b8] ml-2">${monthlyPayment(base, selectedTerm).toFixed(0)}/mo</span>
                </div>
                <div className="text-[#22c55e] text-center">
                  <span>→ +${diff}/mo →</span>
                  <span className="text-xs block text-[#64748b]">+${dailyDiff.toFixed(2)}/day</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-bold">{nextBase}</span>
                  <span className="text-[#94a3b8] ml-2">${monthlyPayment(nextBase, selectedTerm).toFixed(0)}/mo</span>
                </div>
                <div className="flex-1 text-sm text-[#94a3b8]">
                  Adds: {upgrades.join(', ')}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Section 7 - Term Selector */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Adjust your financing term</h2>
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setSelectedTerm(24)}
            className={`flex-1 max-w-[200px] p-4 rounded-lg border-2 transition-colors ${
              selectedTerm === 24 
                ? 'border-[#f59e0b] bg-[#f59e0b] text-[#0f172a]' 
                : 'border-[#334155] bg-[#1e293b]'
            }`}
          >
            <div className="font-bold">24 Months ⭐</div>
            <div className="text-sm opacity-80">Pay it off faster</div>
          </button>
          <button
            onClick={() => setSelectedTerm(72)}
            className={`flex-1 max-w-[200px] p-4 rounded-lg border-2 transition-colors ${
              selectedTerm === 72 
                ? 'border-[#f59e0b] bg-[#f59e0b] text-[#0f172a]' 
                : 'border-[#334155] bg-[#1e293b]'
            }`}
          >
            <div className="font-bold">72 Months ⭐</div>
            <div className="text-sm opacity-80">Lowest monthly payment</div>
          </button>
        </div>
        
        <button
          onClick={() => setShowAllTerms(!showAllTerms)}
          className="text-[#94a3b8] text-sm mb-4 hover:text-[#f59e0b]"
        >
          See all terms {showAllTerms ? '▲' : '▼'}
        </button>
        
        {showAllTerms && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {[6, 12, 36, 48, 60].map(term => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term as Term)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  selectedTerm === term 
                    ? 'bg-[#f59e0b] text-[#0f172a]' 
                    : 'bg-[#1e293b] text-[#94a3b8]'
                }`}
              >
                {term} mo
              </button>
            ))}
          </div>
        )}
        
        {focusedCard && (
          <div className="bg-[#1e293b] rounded-lg p-6">
            <h3 className="font-bold mb-4">{focusedCard} Comparison</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[#64748b] text-sm">24 Months</p>
                <p className="text-2xl font-bold text-[#f59e0b]">${monthlyPayment(focusedCard, 24).toFixed(0)}/mo</p>
              </div>
              <div className="text-center">
                <p className="text-[#64748b] text-sm">72 Months</p>
                <p className="text-2xl font-bold text-[#f59e0b]">${monthlyPayment(focusedCard, 72).toFixed(0)}/mo</p>
              </div>
            </div>
            <p className="text-center text-[#22c55e] mt-4">
              Choosing 72 months saves you ${(monthlyPayment(focusedCard, 24) - monthlyPayment(focusedCard, 72)).toFixed(0)}/mo
            </p>
          </div>
        )}
      </section>

      {/* Section 8 - Sleep Cost Anchor */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">What poor sleep is already costing you</h2>
        <p className="text-[#94a3b8] mb-8">Before you consider the cost of a base, consider the cost of doing nothing.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { tier: 'Conservative', annual: 6000, monthly: 500, daily: 16.44 },
            { tier: 'Moderate', annual: 10000, monthly: 833, daily: 27.40, highlight: true },
            { tier: 'Aggressive', annual: 15000, monthly: 1250, daily: 41.10 },
          ].map(({ tier, annual, monthly, daily, highlight }) => (
            <div key={tier} className={`rounded-lg p-6 text-center ${
              highlight ? 'bg-[#1e293b] border-2 border-[#f59e0b]' : 'bg-[#1e293b] border border-[#334155]'
            }`}>
              <p className="text-[#94a3b8] mb-2">{tier}</p>
              <p className="text-2xl font-bold text-[#f59e0b]">${annual.toLocaleString()}</p>
              <p className="text-sm text-[#64748b]">Annual</p>
              <p className="text-lg font-semibold mt-2">${monthly}/mo</p>
              <p className="text-sm text-[#64748b]">${daily}/day</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[#94a3b8] mt-6">
          Poor sleep costs the average American $833/month. The {recommendedBase || 'Ergo Smart'} {selectedSize} at 72 months is ${p72Recommended || 30}/month — that's {((p72Recommended || 30) / 833 * 100).toFixed(1)}% of what poor sleep is already taking from you.
        </p>
        <p className="text-center text-[#64748b] text-sm mt-2">
          Sources: RAND Corporation (2016), Harvard Medical School American Insomnia Survey, Gallup (2022)
        </p>
      </section>

      {/* Section 9 - Smart Insight */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="bg-[#1e293b] border-l-4 border-[#f59e0b] rounded-r-lg p-6">
          <p className="text-lg">{getInsight()}</p>
        </div>
      </section>

      {/* Section 10 - Shareable Summary */}
      <section className="px-6 py-16 max-w-md mx-auto">
        <div className="bg-[#1e293b] rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold mb-4">Your Recommendation</h3>
          {(focusedCard || recommendedBase) ? (
            <>
              <p className="text-2xl font-bold text-[#f59e0b] mb-2">{(focusedCard || recommendedBase)} - {selectedSize}</p>
              <p className="text-3xl font-bold mb-1">${PAYMENTS_72[selectedSize][(focusedCard || recommendedBase)!]}/mo</p>
              <p className="text-[#64748b] text-sm mb-4">72 months</p>
              <p className="text-[#22c55e] mb-4">${dailyCost((focusedCard || recommendedBase)!, 72).toFixed(2)}/day</p>
              
              <div className="mb-4">
                <QRCodeSVG 
                  value="https://m3rcey.github.io/base-calculator/" 
                  size={120}
                  className="mx-auto"
                  bgColor="#1e293b"
                  fgColor="#f8fafc"
                />
              </div>
              
              <button
                onClick={copySummary}
                className="w-full py-3 bg-[#f59e0b] text-[#0f172a] font-bold rounded-lg hover:bg-[#fbbf24] transition-colors"
              >
                Copy Summary
              </button>
              
              <p className="text-[#64748b] text-xs mt-4">
                Pricing based on 72-month financing. See a Sleep Expert at Mattress Firm for current offers.
              </p>
            </>
          ) : (
            <p className="text-[#94a3b8]">Select a base to see your recommendation</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-[#64748b] text-sm">
        <p>Built for Mattress Firm Sleep Experts</p>
      </footer>
    </div>
  )
}

export default App
