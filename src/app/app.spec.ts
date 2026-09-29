import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the name and role', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Kovács Kristóf Gábor');
    expect(compiled.querySelector('.role')?.textContent).toContain('Frontend fejlesztő');
  });

  it('should render one menu item per section', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.menu-item').length).toBe(5);
  });

  it('should replace an open section when another menu item is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.autoDetectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll<HTMLButtonElement>('.menu-item');
    const panelTitle = () => compiled.querySelector('app-section-panel h2')?.textContent?.trim();
    const panelShown = () => compiled.querySelector('app-section-panel')?.classList.contains('shown');

    items[0].click();
    await waitFor(() => panelShown() === true);
    expect(panelTitle()).toBe('Elérhetőség');
    await new Promise((resolve) => setTimeout(resolve, 700));

    items[1].click();
    fixture.detectChanges();
    expect(panelShown()).toBe(false);
    expect(panelTitle()).toBe('Elérhetőség');
    await waitFor(() => panelShown() === true && panelTitle() === 'Tanulmányok');
    expect(items[1].getAttribute('aria-expanded')).toBe('true');
    expect(items[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('should link to the project source under the contact details', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.autoDetectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const panel = () => compiled.querySelector('app-section-panel');

    compiled.querySelector<HTMLButtonElement>('.menu-item')!.click();
    await waitFor(() => panel()?.classList.contains('shown') === true);

    const items = panel()!.querySelectorAll('.item');
    const link = items[items.length - 1].querySelector('a')!;
    expect(link.textContent).toContain('Ennek a projektnek a kódja');
    expect(link.getAttribute('href')).toBe('https://github.com/kovacskristofgabor/oneletrajz-kkg');
  });

  it('should open the about section when the name is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.autoDetectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const panel = () => compiled.querySelector('app-section-panel');

    compiled.querySelector<HTMLButtonElement>('.name-button')!.click();
    await waitFor(() => panel()?.classList.contains('shown') === true);

    expect(panel()!.querySelector('h2')?.textContent?.trim()).toBe('Ki vagyok én?');
    expect(panel()!.querySelectorAll('.paragraph').length).toBe(5);
    const body = panel()!.querySelector('.body')!;
    expect(body.textContent).toContain('zenéket "Kill Lincs');
    expect(body.textContent).toContain('az "IKON Zrt.');
    expect(body.textContent).toContain('Kedvenc állatom a capybara.');
    const hrefs = Array.from(body.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      'https://open.spotify.com/artist/012Y4YEbRYW43JrxZqwMDy?si=JMyv0-7JQROCtESO6INGPQ',
      'https://www.instagram.com/ikonzrt/',
    ]);
  });
});

async function waitFor(condition: () => boolean, timeoutMs = 3000): Promise<void> {
  const start = performance.now();
  while (!condition()) {
    if (performance.now() - start > timeoutMs) {
      throw new Error('Timed out waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
