import { Bot, Send, Sparkles, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { bestNextLife, suggestPrice } from '../../services/ai';
import { buildMatches } from '../../services/matching';
import { useRaw } from '../../store/RawStore';

type Message = { role: 'assistant' | 'user'; text: string };

const quickPrompts = [
  'How should I price 50 kg copper?',
  'Find nearby demand for copper',
  'Why was this match selected?',
  'What can I do with damaged furniture?',
];

function formatAssistantReply(input: string, context: ReturnType<typeof useRaw>) {
  const q = input.toLowerCase();
  const listings = context.listings;
  const requirements = context.requirements;

  const kgMatch = q.match(/(\d+(?:\.\d+)?)\s*kg/);
  const copper = q.includes('copper');
  const furniture = q.includes('furniture') || q.includes('chair');

  if (q.includes('price') || q.includes('cost') || q.includes('pricing')) {
    const material = copper ? 'Copper Wire' : furniture ? 'Used Office Chairs' : 'Copper Wire';
    const quantity = kgMatch ? Number(kgMatch[1]) : 50;
    const result = suggestPrice(material, quantity);
    return `For ${quantity} ${material === 'Used Office Chairs' ? 'units' : 'kg'} of ${material}, my current demo estimate is ₹${result.low}–₹${result.high} per unit. I would start around ₹${result.recommended}, with ${result.confidence}% confidence. Treat this as a pricing estimate, not a live market quote.`;
  }

  if (q.includes('match') || q.includes('nearby demand') || q.includes('who needs')) {
    const matches = buildMatches(listings, requirements).slice(0, 3);
    if (!matches.length) return 'I do not have a compatible active requirement in the current demo data. Post a requirement and RAW will be able to rank potential matches.';
    const top = matches[0];
    const listing = listings.find(x => x.id === top.resourceId);
    const requirement = requirements.find(x => x.id === top.requirementId);
    if (!listing || !requirement) return 'I found a potential match, but the demo data is incomplete.';
    return `Top match: ${listing.material} (${listing.quantity} ${listing.unit}) → ${requirement.material} requirement for ${requirement.quantity} ${requirement.unit}. Match score ${top.score}%. Reasons: ${top.explanation.slice(0, 3).join('; ')}.`;
  }

  if (q.includes('why') || q.includes('selected')) {
    const matches = buildMatches(listings, requirements).slice(0, 1);
    if (!matches.length) return 'There is no active match to explain yet. Create a listing and a compatible requirement first.';
    return `RAW selected the strongest candidate using material compatibility, quantity coverage, distance, price fit, availability, trust, circularity and urgency. The top score is ${matches[0].score}%.`;
  }

  if (q.includes('damaged') || furniture) {
    const result = bestNextLife('Furniture', 'DAMAGED', 78);
    return `For damaged furniture, RAW recommends ${result.label.toLowerCase()}. ${result.reason}`;
  }

  if (q.includes('material') || q.includes('identify') || q.includes('copper')) {
    const sample = listings.find(x => x.material.toLowerCase().includes('copper'));
    return sample
      ? `The current demo inventory includes ${sample.material}. A real RAW image scan can classify the material and return a confidence score before publishing.`
      : 'Upload a material photo from the List RAW flow and RAW can return a material, category, confidence score and condition suggestion.';
  }

  return 'I can help with material identification, smart pricing, RAW Match explanations, nearby demand, and reuse pathways. Try one of the suggested prompts below.';
}

export default function Assistant() {
  const context = useRaw();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I can help identify materials, suggest a price, explain a RAW Match, find nearby demand, or suggest the best next life for a resource.' },
  ]);
  const [thinking, setThinking] = useState(false);

  const suggestions = useMemo(() => quickPrompts, []);

  const send = (value = input) => {
    const text = value.trim();
    if (!text || thinking) return;
    setMessages(items => [...items, { role: 'user', text }]);
    setInput('');
    setThinking(true);
    window.setTimeout(() => {
      const reply = formatAssistantReply(text, context);
      setMessages(items => [...items, { role: 'assistant', text: reply }]);
      setThinking(false);
    }, 450);
  };

  return <AppShell>
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.65fr] lg:items-end">
        <div>
        <p className="text-sm font-semibold text-teal-700">AI workspace</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">RAW Assistant</h1>
        <p className="mt-2 text-sm text-slate-500">Ask about materials, pricing, matches and reuse pathways.</p>
        </div>
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
          <img src="/material-copper.svg" alt="Copper wire material" className="h-28 w-full object-cover"/>
          <div className="px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">Material-aware</p><p className="mt-1 text-sm font-semibold text-slate-800">Ask RAW about price, reuse or matching.</p></div>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><Bot className="h-5 w-5" /></div>
            <div><div className="font-bold">RAW Assistant</div><div className="text-xs text-slate-500">Demo intelligence is active</div></div>
          </div>
        </div>
        <div className="max-h-[520px] space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-white"><Bot className="h-4 w-4" /></div>}
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-700'}`}>{message.text}</div>
              {message.role === 'user' && <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700"><User className="h-4 w-4" /></div>}
            </div>
          ))}
          {thinking && <div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-white"><Bot className="h-4 w-4" /></div><div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Thinking…</div></div>}
        </div>
        <div className="border-t border-slate-100 p-4">
          <div className="flex flex-wrap gap-2 pb-3">
            {suggestions.map(prompt => <button key={prompt} type="button" onClick={() => send(prompt)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800">{prompt}</button>)}
          </div>
          <form onSubmit={e => { e.preventDefault(); send(); }} className="flex items-center gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="Ask RAW Assistant..." aria-label="Ask RAW Assistant" />
            <button disabled={!input.trim() || thinking} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send className="h-4 w-4" /></button>
          </form>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400"><Sparkles className="h-3.5 w-3.5" /> Local demo intelligence is active; a hosted AI provider can be connected later.</div>
        </div>
      </div>
    </div>
  </AppShell>;
}
