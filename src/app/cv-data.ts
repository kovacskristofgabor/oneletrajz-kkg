export type ItemIcon = 'phone' | 'mail' | 'home';

export interface SectionItem {
  readonly icon?: ItemIcon;
  readonly meta?: string;
  readonly text: string;
}

export interface Section {
  readonly title: string;
  readonly items: readonly SectionItem[];
}

export const FULL_NAME = 'Kovács Kristóf Gábor';
export const ROLE = 'Frontend fejlesztő';

export const SECTIONS: readonly Section[] = [
  {
    title: 'Elérhetőség',
    items: [
      { icon: 'phone', text: '06 20 427 9549' },
      { icon: 'mail', text: 'k.kristof.gabor@gmail.com' },
      { icon: 'home', text: 'Debrecen' },
    ],
  },
  {
    title: 'Tanulmányok',
    items: [
      {
        meta: '2020 – 2025',
        text: 'Debreceni Egyetem Informatikai Kar, Programtervező Informatikus szak BSc.',
      },
    ],
  },
  {
    title: 'Szakmai tapasztalat',
    items: [
      {
        meta: '2022.06 – 2022.08',
        text: 'InnoviDeb Solutions Kft. – Gyakornok frontend fejlesztő, szoftvertesztelő',
      },
      {
        meta: '2025.09 –',
        text: 'E-Health Innovációs Klaszter Kft. – Junior frontend fejlesztő',
      },
    ],
  },
  {
    title: 'Készségek és kompetenciák',
    items: [
      { text: 'C1 Angol nyelvtudás' },
      { text: 'Angular' },
      { text: 'JavaScript' },
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
