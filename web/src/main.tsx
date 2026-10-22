import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useParams,
  useLocation,
} from "react-router-dom";
import Reveal from "./components/Reveal";
import "./style.css";
type Piece = {
  id: string;
  name: string;
  form: string;
  clay: string;
  glaze: string;
  price: number;
  color: string;
  note: string;
  firing: string;
};
type Commission = { id: string; name: string; piece: string; month: string };
const api = import.meta.env.VITE_API_URL;
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!api) throw Error("The studio connection is not configured.");
  const r = await fetch(api.replace(/\/$/, "") + path, options);
  if (!r.ok) {
    const e = await r.json().catch(() => null);
    throw Error(e?.message || "The studio is unavailable. Please try again.");
  }
  return r.json();
}
function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    setData(null);
    request<T>(path)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [path, version]);
  return { data, error, retry: () => setVersion((v) => v + 1) };
}
function Status({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="status" role="status">
      {error || "Opening the studio book…"}
      {error && (
        <button className="text-button" onClick={retry}>
          Try again{" "}
        </button>
      )}
    </div>
  );
}
function Pot({
  form = "vase",
  color = "#bdb39e",
  id = "pot",
  className = "",
}: {
  form?: string;
  color?: string;
  id?: string;
  className?: string;
}) {
  const paths: Record<string, string> = {
    vase: "M122 54 Q118 48 126 44 L175 44 Q182 47 177 54 L174 101 C174 126 220 142 222 187 Q233 266 199 279 Q150 294 102 279 C68 266 72 189 85 166 Q95 143 124 103 Z",
    bowl: "M35 140 Q150 120 265 140 Q250 234 186 255 L115 255 Q48 233 35 140Z",
    cup: "M77 106 Q150 96 223 106 L209 243 Q150 260 91 243Z",
    lamp: "M149 37 Q90 53 50 151 L250 151 Q210 54 149 37Z M139 154 L162 154 L167 253 L197 265 L104 265 L134 253Z",
  };
  const variants: Record<string, string> = {
    "05": "M28 160 Q150 143 272 160 Q252 230 185 250 L115 250 Q48 230 28 160Z",
    "06": "M87 82 Q150 73 213 82 L205 253 Q150 267 95 253Z",
    "07": "M119 73 L181 73 L178 114 C185 141 238 153 238 207 Q245 269 195 282 L106 282 Q56 269 63 207 C63 153 115 141 122 114Z",
    "08": "M30 185 Q150 170 270 185 Q249 228 188 237 L112 237 Q51 228 30 185Z",
  };
  const variant = variants[id.replace("detail", "")];
  return (
    <svg
      className={"pot " + className}
      viewBox="0 0 300 320"
      role="img"
      aria-label={`${form}, hand-thrown stoneware`}
    >
      <defs>
        <linearGradient id={"g" + id}>
          <stop stopColor="#fff" stopOpacity=".25" />
          <stop offset=".4" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#17150f" stopOpacity=".3" />
        </linearGradient>
        <filter id={"t" + id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".7"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".15" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      <ellipse cx="150" cy="283" rx="85" ry="7" fill="#292219" opacity=".09" />
      <g filter={`url(#t${id})`}>
        <path d={variant || paths[form]} fill={color} />
        <path d={variant || paths[form]} fill={`url(#g${id})`} />
      </g>
      {form === "bowl" && (
        <ellipse
          cx="150"
          cy={id.endsWith("05") ? 160 : id.endsWith("08") ? 185 : 140}
          rx="115"
          ry="13"
          fill="#40382a"
          opacity=".3"
        />
      )}
      {form === "cup" && (
        <>
          <ellipse
            cx="150"
            cy={id.endsWith("06") ? 82 : 106}
            rx={id.endsWith("06") ? 63 : 73}
            ry="9"
            fill="#292e24"
            opacity=".3"
          />
          <path
            d="M221 131 C279 122 272 211 215 208"
            fill="none"
            stroke={color}
            strokeWidth="16"
          />
        </>
      )}
    </svg>
  );
}
function Card({ piece: p, index = 0 }: { piece: Piece; index?: number }) {
  return (
    <Link to={"/piece/" + p.id} className={"piece-card card-" + (index % 3)}>
      <div className="piece-art">
        <span className="edition">Nº {p.id} / STONEWARE</span>
        <Pot form={p.form} color={p.color} id={p.id} />
        <span className="art-arrow"></span>
      </div>
      <div className="piece-caption">
        <h3>{p.name}</h3>
        <span>{p.price.toLocaleString("da-DK")} DKK</span>
      </div>
      <p className="piece-material">
        {p.clay} · {p.glaze}
      </p>
    </Link>
  );
}
function Home() {
  const d = useData<Piece[]>("/pieces");
  return (
    <>
      <section className="hero">
        <div className="hero-top">
          <span className="eyebrow">A CERAMICS STUDIO IN COPENHAGEN</span>
          <span className="tiny">55°41′ N &nbsp; 12°33′ E</span>
        </div>
        <Reveal>
          <h1>
            Sable <em>&</em> Kiln<span>.</span>
          </h1>
        </Reveal>
        <div className="hero-bottom">
          <p>
            Objects for the everyday.
            <br />
            Made slowly, to stay.
          </p>
          <Link className="underlink" to="/collection">
            Explore the collection{" "}
          </Link>
        </div>
        <div className="still-life">
          <div className="light-wall" />
          <div className="plinth" />
          <Pot id="hero-vase" className="hero-vase" />
          <Pot form="cup" color="#53634c" id="hero-cup" className="hero-cup" />
          <Pot
            form="bowl"
            color="#a48b6b"
            id="hero-bowl"
            className="hero-bowl"
          />
          <span className="still-caption">CLAY. FIRE. A LITTLE TIME.</span>
          <span className="still-number">STUDY No. 01 — NØRREBRO, 2026</span>
        </div>
        <div className="hero-foot">
          <span>Thrown by hand. Never quite the same.</span>
          <a href="#selected">A few things from the kiln</a>
        </div>
      </section>
      <section className="section" id="selected">
        <div className="section-title">
          <div>
            <span className="eyebrow">01 / THE CURRENT FIRING</span>
            <h2>A few good things.</h2>
          </div>
          <Link className="underlink" to="/collection">
            All eight pieces{" "}
          </Link>
        </div>
        {d.data ? (
          <div className="broken-grid">
            {d.data.slice(0, 3).map((p, i) => (
              <Card key={p.id} piece={p} index={i} />
            ))}
          </div>
        ) : (
          <Status {...d} />
        )}
      </section>
      <section className="story section">
        <span className="eyebrow">
          02 / A SMALL STUDIO,
          <br />A SHARED FIRE
        </span>
        <div>
          <h2>The courtyard kiln.</h2>
          <p>
            Behind a blue door in Nørrebro, we throw stoneware for the things
            that happen every day. Coffee before anyone wakes. Supper that runs
            a little late. A branch brought home on the way.
          </p>
          <p className="muted">
            Small runs, a shared courtyard kiln, and a Thursday firing. The fire
            always gets the last word.
          </p>
          <Link className="underlink" to="/visit">
            Find the blue door{" "}
          </Link>
        </div>
        <div className="studio-stamp">
          S<span>&</span>K
          <small>
            COPENHAGEN
            <br />
            HAND TO EARTH
          </small>
        </div>
      </section>
      <section className="invitation">
        <span className="eyebrow">SOMETHING JUST FOR YOUR TABLE</span>
        <h2>
          Good things
          <br />
          begin with a conversation.
        </h2>
        <Link className="commission-button" to="/commission">
          Commission a piece{" "}
        </Link>
        <p>A favourite shape. A different glaze. A set to grow old with.</p>
      </section>
    </>
  );
}
function Collection() {
  const d = useData<Piece[]>("/pieces");
  const [filter, setFilter] = useState("all");
  const shown = d.data?.filter((p) => filter === "all" || p.form === filter);
  return (
    <main className="page">
      <span className="eyebrow">THE STUDIO COLLECTION / SMALL RUNS</span>
      <div className="page-heading">
        <h1>For the everyday.</h1>
        <p>
          Thrown, glazed, and fired in Nørrebro.
          <br />A family of objects, each a little different.
        </p>
      </div>
      <div className="filters" aria-label="Filter by form">
        {["all", "bowl", "cup", "vase", "lamp"].map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All pieces" : f + "s"}
            {f === "all" && <sup>08</sup>}
          </button>
        ))}
        <span>STONEWARE · COPENHAGEN</span>
      </div>
      {!d.data ? (
        <Status {...d} />
      ) : shown?.length ? (
        <div className="collection-grid">
          {shown.map((p, i) => (
            <Card key={p.id} piece={p} index={i} />
          ))}
        </div>
      ) : (
        <p className="status">Nothing in this firing just yet.</p>
      )}
      <p className="collection-end">
        A little variation is the point.
        <br />
        Every piece carries the hand that made it.
      </p>
    </main>
  );
}
function PiecePage() {
  const { id } = useParams();
  const d = useData<Piece>("/pieces/" + id);
  const [note, setNote] = useState(""),
    [source, setSource] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setNote("");
    setSource("");
    setError("");
  }, [id]);
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const r = await request<{ note: string; source: string }>(
        `/pieces/${id}/kiln-note`,
        { method: "POST" },
      );
      setNote(r.note);
      setSource(r.source);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const p = d.data;
  return (
    <main className="page">
      <Link className="back-link" to="/collection">
        Back to the collection
      </Link>
      {!p ? (
        <Status {...d} />
      ) : (
        <div className="piece-detail">
          <div className="detail-art">
            <span className="eyebrow">Nº {p.id} / A SABLE & KILN OBJECT</span>
            <Pot form={p.form} color={p.color} id={"detail" + p.id} />
            <span className="tiny">HAND-THROWN IN NØRREBRO</span>
          </div>
          <div className="detail-copy">
            <span className="eyebrow">THE CURRENT FIRING</span>
            <h1>{p.name}</h1>
            <p className="price">{p.price.toLocaleString("da-DK")} DKK</p>
            <p>{p.note}</p>
            <dl>
              <div>
                <dt>Clay body</dt>
                <dd>{p.clay}</dd>
              </div>
              <div>
                <dt>Glaze</dt>
                <dd>{p.glaze}</dd>
              </div>
              <div>
                <dt>Firing</dt>
                <dd>{p.firing}</dd>
              </div>
            </dl>
            <section className="kiln-note">
              <span className="eyebrow">A NOTE FROM THE KILN</span>
              {note ? (
                <>
                  <p aria-live="polite">{note}</p>
                  <span className="source">— {source}</span>
                </>
              ) : (
                <p className="muted">
                  Let the studio find a few words for this particular piece.
                </p>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="text-button"
                disabled={busy}
                onClick={generate}
              >
                {busy
                  ? "Writing from the kiln…"
                  : error
                    ? "Try the kiln note again "
                    : "Write the kiln note "}
              </button>
            </section>
            <Link
              className="commission-button"
              to={"/commission?piece=" + p.id}
            >
              Commission this piece{" "}
            </Link>
            <p className="tiny detail-foot">
              MADE TO ORDER · WE’LL AGREE THE DETAILS TOGETHER
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
function CommissionPage() {
  const pieces = useData<Piece[]>("/pieces"),
    recent = useData<Commission[]>("/commissions");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  const selected = new URLSearchParams(useLocation().search).get("piece") || "";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    try {
      await request("/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setDone(true);
      recent.retry();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <span className="eyebrow">THE COMMISSION DESK</span>
      <div className="page-heading">
        <h1>A place at your table.</h1>
        <p>
          Tell us what you have in mind.
          <br />
          We’ll take it from there, together.
        </p>
      </div>
      <div className="commission-layout">
        <aside>
          <span className="eyebrow">MADE SLOWLY. MADE FOR YOU.</span>
          <p>
            A pair of cups for the morning. A bowl big enough for everyone.
            Something we haven’t made yet.
          </p>
          <p className="muted">
            We work in small batches. A request starts a conversation, with no
            payment or commitment. We’ll reply by email with timing and a quote.
          </p>
          <Pot color="#74745b" id="commission" />
        </aside>
        <div>
          {done ? (
            <div className="confirmation" role="status">
              <span className="eyebrow">SAFELY AT THE STUDIO</span>
              <h2>
                Thank you.
                <br />
                We have a place to begin.
              </h2>
              <p>
                Your request has been saved. We’ll write to you soon to talk
                about clay, glaze, and the little details.
              </p>
              <button className="text-button" onClick={() => setDone(false)}>
                Start another conversation{" "}
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="form-pair">
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder="How should we call you?"
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="A place to write back"
                  />
                </label>
              </div>
              <label>
                The piece you have in mind
                <select
                  key={pieces.data ? "ready" : "loading"}
                  name="pieceId"
                  defaultValue={selected}
                  disabled={!pieces.data}
                >
                  <option value="">Something new</option>
                  {pieces.data?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              {!pieces.data && <Status {...pieces} />}
              <label>
                A little about your table
                <textarea
                  name="story"
                  required
                  maxLength={2000}
                  rows={4}
                  placeholder="What do your everyday rituals look like?"
                />
              </label>
              <label>
                Preferred month
                <input
                  name="month"
                  type="month"
                  required
                  min={new Date().toISOString().slice(0, 7)}
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="form-bottom">
                <span className="muted">Good things take a little time.</span>
                <button className="commission-button" disabled={busy}>
                  {busy ? "Sending to the studio…" : "Send your request "}
                </button>
              </div>
            </form>
          )}
          <section className="recent">
            <span className="eyebrow">RECENT CONVERSATIONS</span>
            {!recent.data ? (
              <Status {...recent} />
            ) : recent.data.length ? (
              <ul>
                {recent.data.map((c) => (
                  <li key={c.id}>
                    <span>
                      {c.name}
                      <small>{c.piece}</small>
                    </span>
                    <time>
                      {new Date(c.month + "-02").toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">
                The commission book is open. Yours could be the first
                conversation.
              </p>
            )}
            <p className="tiny">
              ONLY FIRST NAMES AND PIECES ARE SHARED. THE REST STAYS WITH US.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
function Visit() {
  return (
    <main className="page visit">
      <span className="eyebrow">COME BY / NØRREBRO, COPENHAGEN</span>
      <h1>
        Behind the
        <br />
        blue door.
      </h1>
      <div className="visit-layout">
        <div className="door-art">
          <div className="door">
            <span>17</span>
            <i />
          </div>
          <span className="tiny">THE COURTYARD STUDIO</span>
        </div>
        <div>
          <h2>
            A small corner
            <br />
            of Copenhagen.
          </h2>
          <p>
            Sable & Kiln
            <br />
            17 Jægersborggade, courtyard studio
            <br />
            2200 Copenhagen N, Denmark
          </p>
          <dl>
            <div>
              <dt>Friday</dt>
              <dd>12:00–17:00</dd>
            </div>
            <div>
              <dt>Saturday</dt>
              <dd>11:00–15:00</dd>
            </div>
            <div>
              <dt>Other days</dt>
              <dd>By appointment</dd>
            </div>
          </dl>
          <p className="muted">
            We fire the shared courtyard kiln on Thursdays. It’s a working day,
            with shelves to fill and a little anticipation in the air. Come back
            on Friday to see what the fire left us.
          </p>
          <a className="underlink" href="mailto:studio@sableandkiln.example">
            Write to the studio{" "}
          </a>
          <p className="tiny">
            A FICTIONAL STUDIO. A PUBLIC DEMO, MADE WITH CARE.
          </p>
        </div>
      </div>
    </main>
  );
}
function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <header>
        <Link className="wordmark" to="/">
          sable <em>&</em> kiln<span>®</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/collection">Collection</NavLink>
          <NavLink to="/commission">Commissions</NavLink>
          <NavLink to="/visit">Visit the studio </NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/piece/:id" element={<PiecePage />} />
        <Route path="/commission" element={<CommissionPage />} />
        <Route path="/visit" element={<Visit />} />
        <Route
          path="*"
          element={
            <main className="page">
              <h1>A little off the path.</h1>
              <Link to="/">Return to the studio </Link>
            </main>
          }
        />
      </Routes>
      <footer>
        <Link className="footer-brand" to="/">
          Sable & Kiln.
        </Link>
        <p>
          Clay, fire, and the everyday.
          <br />
          Nørrebro, Copenhagen.
        </p>
        <div>
          <Link to="/collection">The collection </Link>
          <Link to="/commission">A commission </Link>
        </div>
        <span className="tiny">
          © {new Date().getFullYear()} SABLE & KILN
          <br />A FICTIONAL STUDIO / PUBLIC DEMO
        </span>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
