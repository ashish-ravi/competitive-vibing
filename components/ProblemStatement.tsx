import ReactMarkdown from 'react-markdown';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { topicLabel } from '@/lib/stats';
import type { PublicProblem } from '@/lib/db';

export function ProblemStatement({ problem }: { problem: PublicProblem }) {
  return (
    <article className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2.5 text-[14px] text-muted-foreground">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span>{problem.topics.map(topicLabel).join(' · ')}</span>
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-display md:text-[40px]">
          {problem.title}
        </h1>
      </header>

      <div className="prose max-w-none text-[17px] leading-relaxed text-foreground dark:prose-invert prose-p:my-3 prose-strong:font-semibold [&_code]:rounded-md [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[15px] [&_code]:font-normal [&_code]:before:content-none [&_code]:after:content-none">
        <ReactMarkdown>{problem.statement}</ReactMarkdown>
      </div>

      <div className="space-y-3">
        {problem.examples.map((example, i) => (
          <section key={i} className="rounded-2xl bg-card p-5">
            <h2 className="text-[13px] font-semibold text-muted-foreground">Example {i + 1}</h2>
            <dl className="mt-2 space-y-1.5 font-mono text-[14px] leading-relaxed">
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">Input</dt>
                <dd className="min-w-0 break-words">{example.input}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">Output</dt>
                <dd className="min-w-0 break-words">{example.output}</dd>
              </div>
            </dl>
            {example.explanation && (
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                {example.explanation}
              </p>
            )}
          </section>
        ))}
      </div>

      <section>
        <h2 className="text-[15px] font-semibold">Constraints</h2>
        <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-muted-foreground">
          {problem.constraints.map((c, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden />
              <span className="break-words font-mono text-[14px]">{c}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
