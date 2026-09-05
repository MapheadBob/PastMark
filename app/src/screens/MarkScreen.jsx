import MarkHeader from "../components/MarkHeader";
import MarkPin from "./MarkPin";
import MarkWhen from "./MarkWhen";
import MarkChoice from "./MarkChoice";
import MarkSee from "./MarkSee";
import MarkMatch from "./MarkMatch";
import { marksOrder, subjectPack } from "../data/subjectPack";
import { useGameState } from "../state/GameContext";

export default function MarkScreen() {
  const { session } = useGameState();
  if (!session) return null;
  const markKey = marksOrder[session.markIndex];

  return (
    <div className="pm-app pm-app--gameplay">
      <MarkHeader
        markIndex={session.markIndex}
        phase={session.phase}
        runningTotal={session.runningTotal}
        answers={session.answers}
        markStartedAt={session.markStartedAt}
      />
      {markKey === "pin" && <MarkPin session={session} />}
      {markKey === "when" && <MarkWhen session={session} />}
      {markKey === "know" && (
        <MarkChoice
          session={session}
          markKey="know"
          data={subjectPack.know}
          kicker="IDENTITY · ALL OR NOTHING"
          markNumber={3}
          nextLabel="Next Mark — See"
        />
      )}
      {markKey === "see" && <MarkSee session={session} />}
      {markKey === "era" && (
        <MarkChoice
          session={session}
          markKey="era"
          data={subjectPack.era}
          kicker="THE PERIOD · ALL OR NOTHING"
          markNumber={5}
          nextLabel="Next Mark — Succession"
        />
      )}
      {markKey === "succession" && (
        <MarkChoice
          session={session}
          markKey="succession"
          data={subjectPack.succession}
          kicker="WHAT CAME NEXT · ALL OR NOTHING"
          markNumber={6}
          nextLabel="Next Mark — Match"
          contextBanner={
            session.answers.era ? (
              <div className="pm-succession-banner">
                <span className="pm-mono-label pm-succession-banner__chip">
                  MARK 5 · {subjectPack.era.options[session.answers.era.selectedIndex].toUpperCase()}
                </span>
                <span className="pm-mono-label pm-succession-banner__arrow">→</span>
                <span className="pm-mono-label pm-succession-banner__chip pm-succession-banner__chip--next">
                  MARK 6 · WHAT CAME NEXT
                </span>
              </div>
            ) : null
          }
        />
      )}
      {markKey === "match" && <MarkMatch session={session} />}
    </div>
  );
}
