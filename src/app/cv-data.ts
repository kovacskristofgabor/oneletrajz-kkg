export type ItemIcon = 'phone' | 'mail' | 'home' | 'code';

export interface ItemLink {
  readonly label: string;
  readonly href: string;
}

export type RichText = readonly (string | ItemLink)[];

export interface SectionItem {
  readonly icon?: ItemIcon;
  readonly meta?: string;
  readonly link?: ItemLink;
  readonly text?: string;
  readonly description?: readonly string[];
  readonly paragraph?: RichText;
}

export interface Section {
  readonly title: string;
  readonly items: readonly SectionItem[];
}

export const FULL_NAME = 'Kovács Kristóf Gábor';
export const ROLE = 'Frontend fejlesztő';

export const ABOUT: Section = {
  title: 'Ki vagyok én?',
  items: [
    {
      paragraph: [
        'A nevem Kristóf, Debrecenben születtem 2000. május 4-én. Itt végeztem el a gimnáziumot és itt is diplomáztam programtervező informatikusi szakon. A szakdolgozatom témája egy Angular és NodeJS alapú full-stack webalkalmazás volt.',
      ],
    },
    {
      paragraph: [
        'Az elmúlt időkben a frontend irány érdekelt a legjobban, szeretek minimalista és stílusos dizájnokat készíteni.',
      ],
    },
    {
      paragraph: [
        'Szabadidőmben kreatív hobbikkal foglalom el magam, 2020 óta készítek elektronikus/trap/hyperpop/cloud-rap zenéket "',
        {
          label: 'Kill Lincs',
          href: 'https://open.spotify.com/artist/012Y4YEbRYW43JrxZqwMDy?si=JMyv0-7JQROCtESO6INGPQ',
        },
        '" művésznév alatt, 2024 óta pedig többször felléptem már a bandámmal, az "',
        { label: 'IKON Zrt.', href: 'https://www.instagram.com/ikonzrt/' },
        '"-vel.',
      ],
    },
    {
      paragraph: [
        'Leginkább a kíváncsiság és a tudásvágy motivál, szeretnék fejlődni és fejleszteni és mások segítségére lenni. Szeretnék intuitív, játékos és könnyen kezelhető felületeket és frontend megoldásokat készíteni.',
      ],
    },
    {
      paragraph: ['Kedvenc állatom a capybara.'],
    },
  ],
};

export const SECTIONS: readonly Section[] = [
  {
    title: 'Elérhetőség',
    items: [
      { icon: 'phone', text: '06 20 427 9549' },
      { icon: 'mail', text: 'k.kristof.gabor@gmail.com' },
      { icon: 'home', text: 'Debrecen' },
      {
        icon: 'code',
        link: {
          label: 'Ennek a projektnek a kódja',
          href: 'https://github.com/kovacskristofgabor/oneletrajz-kkg',
        },
      },
    ],
  },
  {
    title: 'Tanulmányok',
    items: [
      {
        meta: '2020 – 2025',
        link: { label: 'Debreceni Egyetem Informatikai Kar', href: 'https://inf.unideb.hu/' },
        text: ', Programtervező Informatikus szak BSc.',
      },
    ],
  },
  {
    title: 'Szakmai tapasztalat',
    items: [
      {
        meta: '2022.06 – 2022.08',
        link: { label: 'InnoviDeb Solutions Kft.', href: 'https://innovitech.hu/' },
        text: ' – Gyakornok frontend fejlesztő, szoftvertesztelő',
        description: [
          'Egy neves borászatnak fejlett M.I. módszerre volt szüksége a szőlőfürtök és azok egyedi részeinek pontos azonosításához. Ebben a projektben működtem együtt a cég szoftvermérnökeivel és a gyakornoktársaimmal egy innovatív gépi tanulási modell manuális betanításában, amelyet a borászat speciális igényeihez igazítottak.',
          'Emellett részt vettem egy Angular alapú raktármenedzsment webalkalmazás fejlesztésében és tesztelésében is, amely során tapasztalatot szereztem a SCRUM módszertan alkalmazásában, beleértve a sprint folyamatokat és a napi stand-up megbeszéléseket.',
        ],
      },
      {
        meta: '2025.09 –',
        link: { label: 'E-Health Innovációs Klaszter Kft.', href: 'https://ehik.hu/' },
        text: ' – Junior frontend fejlesztő',
        description: [
          'Állami és magán egészségügyi szolgáltatók számára fejlesztünk modern, versenyképes szoftveres megoldásokat. Munkám során több projektben is aktívan részt vettem, többek között a Nautopsy, az IS4, a MedCsepp és a Naulog fejlesztésében.',
          'A munkakörömnek köszönhetően jelentős tapasztalatot szereztem a csapatmunkában, valamint abban, hogyan lehet szoros határidők és nagyobb terhelés mellett is hatékonyan dolgozni. Részt vettem új funkciók fejlesztésében, meglévő megoldások módosításában és a felhasználói igényekhez igazodó fejlesztések megvalósításában.',
          'Az itt szerzett tapasztalataim révén nemcsak frontend fejlesztési ismereteimet mélyítettem el, hanem megtanultam önállóan és csapatban is megbízhatóan, határidőre dolgozni.',
        ],
      },
    ],
  },
  {
    title: 'Készségek és kompetenciák',
    items: [
      { text: 'C1 Angol nyelvtudás' },
      { text: 'Angular' },
      { text: 'JavaScript, TypeScript' },
      { text: 'HTML, CSS' },
      { text: 'Git' },
      { text: 'Figma & Penpot' },
      { text: 'Linux Bash' },
      { text: 'Adobe eszközök (Photoshop, Premiere Pro)' },
      { text: 'Microsoft Office eszközök' },
    ],
  },
  {
    title: 'Hobbik és érdeklődési körök',
    items: [
      { text: 'Vizuális művészetek (Videóvágás, Képszerkesztés és Dizájn)' },
      { text: 'Zenei projekt (Produceri, Vokális és Hangmérnöki munkák FL Studio-ban)' },
      { text: 'Videójátékok és technológiák' },
    ],
  },
];
