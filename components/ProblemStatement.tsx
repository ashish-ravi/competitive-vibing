import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import type { PublicProblem } from '@/lib/db';

export function ProblemStatement({ problem }: { problem: PublicProblem }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {problem.topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="font-normal">
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-foreground dark:prose-invert [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_p]:leading-relaxed">
        <ReactMarkdown>{problem.statement}</ReactMarkdown>
      </div>

      <div className="space-y-3">
        {problem.examples.map((example, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Example {i + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 font-mono text-sm">
              <p className="break-words">
                <span className="font-semibold text-muted-foreground">Input: </span>
                {example.input}
              </p>
              <p className="break-words">
                <span className="font-semibold text-muted-foreground">Output: </span>
                {example.output}
              </p>
              {example.explanation && (
                <p className="break-words font-sans text-muted-foreground">{example.explanation}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-1.5 text-sm font-semibold">Constraints</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {problem.constraints.map((c, i) => (
            <li key={i} className="break-words font-mono">
              • {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
