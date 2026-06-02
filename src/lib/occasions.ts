/**
 * Cluster de contenido "Canciones para ocasiones especiales".
 * Cada ocasión es una página (spoke) con contenido único y un deep link
 * contextual a la sección correspondiente de sorpresas.enbogota.app.
 */

export type OccasionLink = {
  text: string;
  href: string;
};

export type Occasion = {
  slug: string;
  navLabel: string;
  kicker: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Resumen corto para la tarjeta del hub. */
  summary: string;
  /** Párrafos de introducción (contenido único). */
  intro: string[];
  /** Qué tipo de canciones encajan en esta ocasión. */
  songGuidance: string;
  /** Consejos prácticos y únicos por ocasión. */
  tips: string[];
  /** Deep link principal a la sección de regalos. */
  gift: OccasionLink;
  /** Frase que cierra la recomendación del regalo. */
  giftTail: string;
  /** Enlaces secundarios opcionales (guías de la web destino). */
  extraLinks?: OccasionLink[];
};

const BASE = "https://sorpresas.enbogota.app";

export const OCCASIONS: Occasion[] = [
  {
    slug: "aniversarios",
    navLabel: "Aniversarios",
    kicker: "Aniversarios",
    h1: "Canciones cristianas para aniversarios",
    metaTitle: "Canciones cristianas para aniversarios: ideas y dedicatorias",
    metaDescription:
      "Ideas de canciones cristianas para celebrar un aniversario de pareja o de fe, con consejos para dedicarlas y completar el detalle en Bogotá.",
    summary:
      "Baladas de adoración y canciones de pacto para celebrar el camino recorrido juntos.",
    intro: [
      "Un aniversario no celebra solo una fecha: celebra un pacto y el camino recorrido. Por eso la música que elijas debe contar esa historia, recordar de dónde vienen y dar gracias por el amor que los sostiene.",
      "Las canciones cristianas tienen una ventaja: hablan de fidelidad, gratitud y propósito, justo los temas que dan profundidad a una celebración de aniversario.",
    ],
    songGuidance:
      "Funcionan especialmente bien las baladas de adoración pausadas, las canciones que hablan de pacto y fidelidad, y los himnos de gratitud. Si tienen una canción que marcó una etapa —la de su boda o la de un momento difícil que superaron— dale el lugar central.",
    tips: [
      "Elige una canción con significado compartido antes que la más popular.",
      "Arma una lista corta de 4 o 5 temas para la cena o el brindis.",
      "Acompaña la canción con una nota escrita que cite una frase de la letra.",
      "Si celebran un aniversario de fe, incluye un himno de gratitud por el tiempo juntos.",
    ],
    gift: {
      text: "regalos de aniversario a domicilio en Bogotá",
      href: `${BASE}/regalos-de-aniversario-bogota`,
    },
    giftTail: "para que la celebración llegue hasta su puerta el mismo día.",
    extraLinks: [
      { text: "qué regalar en un aniversario", href: `${BASE}/guias/que-regalar-en-un-aniversario` },
    ],
  },
  {
    slug: "dia-de-la-madre",
    navLabel: "Día de la Madre",
    kicker: "Día de la Madre",
    h1: "Canciones cristianas para el Día de la Madre",
    metaTitle: "Canciones cristianas para el Día de la Madre: ideas para honrar a mamá",
    metaDescription:
      "Canciones cristianas para honrar a mamá en su día, con consejos para dedicarlas en familia y completar la sorpresa con un detalle a domicilio en Bogotá.",
    summary:
      "Himnos de gratitud y canciones de bendición familiar para honrar a mamá.",
    intro: [
      "Honrar a mamá es uno de los gestos más bonitos que enseña la fe, y la música ayuda a poner en palabras lo que a veces cuesta decir. Una canción bien elegida puede emocionar más que cualquier discurso.",
      "El Día de la Madre es ideal para reunir a la familia alrededor de una canción que agradezca su entrega y su ejemplo.",
    ],
    songGuidance:
      "Busca himnos de gratitud, canciones de bendición familiar y baladas dedicadas. Las letras que mencionan el cuidado, la oración de una madre y la herencia de fe suelen tocar el corazón de inmediato.",
    tips: [
      "Dedícale la canción en voz alta antes de reproducirla.",
      "Reúne a hermanos e hijos para cantarla juntos.",
      "Graba un video corto leyendo la dedicatoria y la letra.",
      "Empieza el día sorprendiéndola con la canción sonando de fondo.",
    ],
    gift: {
      text: "regalos para el Día de la Madre en Bogotá",
      href: `${BASE}/regalos-dia-de-la-madre-bogota`,
    },
    giftTail: "que puedes enviar con una dedicatoria personalizada.",
  },
  {
    slug: "san-valentin",
    navLabel: "San Valentín",
    kicker: "San Valentín",
    h1: "Canciones cristianas para San Valentín",
    metaTitle: "Canciones cristianas para San Valentín: un amor con propósito",
    metaDescription:
      "Canciones cristianas para San Valentín que celebran un amor con propósito, con ideas para dedicarlas y completar la sorpresa en Bogotá.",
    summary:
      "Baladas suaves para celebrar un amor que honra a Dios.",
    intro: [
      "San Valentín se disfruta distinto cuando el amor tiene propósito. Una canción cristiana ayuda a recordar que la relación se construye sobre algo más grande que un sentimiento pasajero.",
      "No hace falta una producción elaborada: una buena balada y una dedicatoria sincera son suficientes para hacer del día algo memorable.",
    ],
    songGuidance:
      "Elige baladas suaves y canciones que celebren un amor que honra a Dios. Las letras sobre entrega, compromiso y gratitud por la otra persona marcan el tono perfecto para la fecha.",
    tips: [
      "Arma una lista de reproducción corta para la cena.",
      "Comparte la canción con un mensaje explicando por qué la elegiste.",
      "Evita los clásicos demasiado oídos: sorprende con algo personal.",
      "Combina la música con un detalle que llegue por sorpresa.",
    ],
    gift: {
      text: "regalos de San Valentín",
      href: `${BASE}/regalos-san-valentin-bogota`,
    },
    giftTail: "para sorprender a esa persona especial el mismo día.",
  },
  {
    slug: "amor-y-amistad",
    navLabel: "Amor y Amistad",
    kicker: "Amor y Amistad",
    h1: "Canciones cristianas para Amor y Amistad",
    metaTitle: "Canciones cristianas para Amor y Amistad: coros para compartir",
    metaDescription:
      "Canciones cristianas alegres para celebrar Amor y Amistad con tus amigos, con ideas para reuniones y detalles a domicilio en Bogotá.",
    summary:
      "Coros alegres y canciones para cantar en grupo con los amigos.",
    intro: [
      "En Colombia, septiembre reúne a los amigos para celebrar Amor y Amistad. Es una fecha perfecta para la música que se canta en grupo y levanta el ánimo de cualquier reunión.",
      "La amistad también es un regalo de Dios, y hay canciones que lo celebran sin caer en lo cursi.",
    ],
    songGuidance:
      "Apuesta por coros alegres de alabanza y canciones conocidas que todos puedan cantar. Los temas con ritmo y mensaje de unidad funcionan mejor que las baladas lentas para un ambiente de amigos.",
    tips: [
      "Prepara una lista que mezcle clásicos y novedades.",
      "Deja que cada amigo proponga una canción para la reunión.",
      "Úsala como fondo para el amigo secreto o el intercambio de detalles.",
      "Cierra la noche con un coro que todos se sepan.",
    ],
    gift: {
      text: "regalos de Amor y Amistad",
      href: `${BASE}/regalos-amor-y-amistad-bogota`,
    },
    giftTail: "para detallar a quienes más quieres.",
  },
  {
    slug: "cumpleanos",
    navLabel: "Cumpleaños",
    kicker: "Cumpleaños",
    h1: "Canciones cristianas para cumpleaños",
    metaTitle: "Canciones cristianas para cumpleaños: bendición y gratitud",
    metaDescription:
      "Canciones cristianas para celebrar un cumpleaños con gratitud y bendición, con ideas para dedicarlas y sorprender a domicilio en Bogotá.",
    summary:
      "Canciones de bendición y gratitud para celebrar un año más de vida.",
    intro: [
      "Un cumpleaños cristiano se celebra dando gracias por un año más de vida y pidiendo bendición para el que viene. La música ayuda a que la reunión tenga ese tono de gratitud.",
      "Más allá de la torta y las velas, una canción dedicada deja un recuerdo que se queda.",
    ],
    songGuidance:
      "Elige canciones de bendición y gratitud. Las letras que hablan de los planes de Dios para la vida del cumpleañero y de agradecer cada etapa son una forma preciosa de celebrar.",
    tips: [
      "Dedica la canción justo antes de partir la torta.",
      "Invita a los presentes a cantarla en coro.",
      "Acompáñala con una oración corta por el cumpleañero.",
      "Envíale una sorpresa temprano para empezar el día con alegría.",
    ],
    gift: {
      text: "regalos de cumpleaños a domicilio",
      href: `${BASE}/regalos-de-cumpleanos-bogota`,
    },
    giftTail: "para que la sorpresa llegue puntual a su celebración.",
    extraLinks: [
      { text: "regalos de cumpleaños originales", href: `${BASE}/guias/regalos-de-cumpleanos-originales` },
    ],
  },
];

export function getOccasion(slug: string): Occasion | undefined {
  return OCCASIONS.find((o) => o.slug === slug);
}

export const OCCASIONS_HUB_PATH = "/canciones-para-ocasiones-especiales";
