import RocketViewer from '../RocketViewer.jsx'
import { Reveal } from '../components/ui.jsx'

export default function Hangar() {
  return (
    <div className="page container">
      <div className="page-head">
        <div className="eyebrow">3D Hangar</div>
        <h1 className="h-display">האנגר תלת ממד</h1>
        <p className="lead">מודל אינטראקטיבי: סובב, קרב, והפרד את הטיל לשלבים כדי לחקור את המבנה.</p>
      </div>
      <Reveal>
        <RocketViewer />
      </Reveal>
    </div>
  )
}
