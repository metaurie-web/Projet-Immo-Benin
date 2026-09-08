import { FAQ } from "@/lib/data";

/* Composant serveur : l'élément <details> gère l'ouverture/fermeture sans
   JavaScript. */
export default function Faq() {
  return (
    <div className="faq" id="faq">
      {FAQ.map((item, i) => (
        <details className="faq__item" key={item.q} open={i === 0}>
          <summary className="faq__q">{item.q}</summary>
          <p className="faq__a">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
