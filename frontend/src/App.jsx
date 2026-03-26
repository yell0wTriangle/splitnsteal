import StartPage from "./pages/StartPage";
import GameRound from "./pages/GameRound";
import PowerUpSelection from "./pages/PowerUpSelection";
import RoundResult from "./pages/RoundResult";
import FinalSummary from "./pages/FinalSummary";
import { useGame } from "./store/gameStore.jsx";

export default function App() {
  const {
    state,
    startGame,
    continueWithPowerup,
    skipPowerup,
    sendMessage,
    submitAction,
    nextRound,
    restart,
  } = useGame();

  if (state.phase === "start") {
    return <StartPage onStart={startGame} pending={state.pending} error={state.error} />;
  }

  if (state.phase === "powerup") {
    return (
      <PowerUpSelection
        state={state}
        pending={state.pending}
        onContinue={continueWithPowerup}
        onSkip={skipPowerup}
      />
    );
  }

  if (state.phase === "round") {
    return <GameRound state={state} onSendMessage={sendMessage} onSubmitAction={submitAction} />;
  }

  if (state.phase === "result") {
    return <RoundResult state={state} pending={state.pending} onNext={nextRound} />;
  }

  return <FinalSummary state={state} onRestart={restart} />;
}
