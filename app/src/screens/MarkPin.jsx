import { useState } from "react";
import { GameMap } from "../components/map/GameMap";
import { MapPin } from "../components/map/MapPin";
import { DistanceLine } from "../components/map/DistanceLine";
import ActionBar from "../components/ActionBar";
import { FeedbackBanner, BreakdownPanel } from "../components/Reveal";
import { subjectPack } from "../data/subjectPack";
import { pinAccuracy, markScore } from "../lib/scoring";
import { useGameDispatch } from "../state/GameContext";

function headlineFor(accuracy) {
  if (accuracy >= 90) return "Right on the Bosphorus";
  if (accuracy >= 60) return "Close to the mark";
  if (accuracy >= 30) return "In the right region";
  return "Far from the mark";
}

export default function MarkPin({ session }) {
  const dispatch = useGameDispatch();
  const [placed, setPlaced] = useState(null);
  const answer = session.answers.pin;
  const isReveal = session.phase === "reveal";

  const handleLockIn = () => {
    if (!placed) return;
    const seconds = Math.round(((Date.now() - session.markStartedAt) / 1000) * 10) / 10;
    const { distanceKm, accuracy } = pinAccuracy(
      { lat: placed.lat, lon: placed.lng },
      subjectPack.pin.trueLocation
    );
    const score = markScore({ accuracy, seconds });
    dispatch({
      type: "LOCK_IN_ANSWER",
      markKey: "pin",
      answer: { accuracy, distanceKm, seconds, discovery: null, ...score },
    });
  };

  if (isReveal && answer) {
    const positive = answer.accuracy >= 60;
    return (
      <div className="pm-mark-screen">
        <div className="pm-reveal-split">
          <div className="pm-reveal-visual pm-reveal-visual--map">
            <GameMap interactive={false} initialCenter={[subjectPack.pin.trueLocation.lon, subjectPack.pin.trueLocation.lat]} initialZoom={5}>
              {(map) => (
                <>
                  <MapPin map={map} variant="guess" coordinates={placed} />
                  <MapPin
                    map={map}
                    variant="correct"
                    coordinates={{ lat: subjectPack.pin.trueLocation.lat, lng: subjectPack.pin.trueLocation.lon }}
                  />
                  <DistanceLine
                    map={map}
                    from={placed}
                    to={{ lat: subjectPack.pin.trueLocation.lat, lng: subjectPack.pin.trueLocation.lon }}
                  />
                </>
              )}
            </GameMap>
            <span className="pm-map-chip">MISS {answer.distanceKm} km</span>
          </div>
          <BreakdownPanel
            accuracyLabel="Location accuracy"
            accuracy={answer.accuracy}
            basePoints={answer.basePoints}
            bonus={answer.bonus}
            seconds={answer.seconds}
            total={answer.total}
            positive={positive}
            nextLabel="Next Mark — When"
            onNext={() => dispatch({ type: "ADVANCE_MARK" })}
          />
        </div>
        <div className="pm-reveal-banner-wrap">
          <FeedbackBanner headline={headlineFor(answer.accuracy)} subline={subjectPack.pin.blurb} positive={positive} />
        </div>
      </div>
    );
  }

  return (
    <div className="pm-mark-screen">
      <div className="pm-mark-prompt-band">
        <span className="pm-mono-label pm-mark-prompt-band__kicker">MARK 1 · PLACE</span>
        <h2 className="pm-mark-prompt-band__prompt">{subjectPack.pin.prompt}</h2>
        <p className="pm-mark-prompt-band__hint">
          Click the map to place your pin. Click again to adjust — nothing counts until you lock it in.
        </p>
      </div>
      <div className="pm-pin-map-wrap">
        <GameMap interactive onMapClick={setPlaced}>
          {(map) => <MapPin map={map} variant="guess" coordinates={placed} />}
        </GameMap>
      </div>
      <ActionBar hint={placed ? "Pin placed — adjust freely" : "Click the map to place your pin"}>
        <button type="button" className="pm-btn" disabled={!placed} onClick={handleLockIn}>
          Lock In
        </button>
      </ActionBar>
    </div>
  );
}
