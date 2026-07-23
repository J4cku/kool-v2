# Widoczność w wyszukiwarkach AI — działania poza stroną

Cel: gdy ktoś pyta Claude'a, ChatGPT albo Perplexity o „architekt wnętrz Wrocław" / „interior designer Warsaw", kool studio ma być znajdowalne i cytowalne. Prace na samej stronie (metadane, canonicale, indeksowalna nawigacja i lista projektów, JSON-LD, llms.txt) zostały wdrożone w lipcu 2026; wszystko poniżej dzieje się **poza repozytorium** i może to zrobić tylko studio (konta, weryfikacje, kontakt z mediami).

Jak silniki AI naprawdę znajdują lokalne firmy (stan na połowę 2026):

- **Claude** wyszukuje przez **Brave Search** (podwykonawca Anthropic; ~87% cytowań Claude'a pokrywa się z topowymi wynikami organicznymi Brave). Brave ma własny, niezależny indeks — obecność w Google **nie** oznacza obecności w Brave.
- **ChatGPT** bierze nazwy lokalnych firm głównie z **Foursquare** (partnerstwo z OpenAI od grudnia 2024), a treści ze stron z indeksu **Bing**.
- **Perplexity** crawluje własnym botem i mocno premiuje **świeżość** treści oraz agregatory opinii/katalogi.
- We wszystkich silnikach badania pokazują, że **wzmianki w mediach i katalogach** przewidują cytowania AI dużo lepiej niż backlinki, a wpisy firmowe (listingi) odpowiadają za ~40% cytowań AI.

## 1. Podstawy indeksowania (zrobić najpierw, łącznie ~1 godzina)

- [ ] **Brave Search** — sprawdź pokrycie zapytaniem `site:koolstudio.pl` na search.brave.com. Zgłoś ręcznie kluczowe adresy na https://search.brave.com/submit-url (strona główna /pl i /en, /pl/projekty, /pl/oferta, /pl/studio, /pl/kontakt, 3–4 najlepsze projekty). Sprawdź ponownie za 30–60 dni. *To najbardziej bezpośrednia dźwignia dla Claude'a.*
- [ ] **Bing Webmaster Tools** — https://www.bing.com/webmasters. Zweryfikuj domenę (można zaimportować weryfikację z Google Search Console), wyślij `https://koolstudio.pl/sitemap.xml`. Potem obserwuj darmowy raport **AI Performance** (pokazuje, jak często Twoje strony są cytowane w odpowiedziach Copilot/Bing AI). *To dźwignia dla warstwy webowej ChatGPT.*
- [ ] **Google Search Console** — jeśli jeszcze nie zweryfikowana, zweryfikuj i wyślij sitemapę (zasila też Gemini / AI Overviews).

## 2. Wizytówki firmowe (warstwa „encji")

NAP (nazwa, adres, telefon) **identyczny co do znaku** wszędzie: `kool studio, Zaporoska 83/15, 53-415 Wrocław` + hello@koolstudio.pl. W każdym opisie wymieniaj **Wrocław (siedziba) i Warszawę (obszar działania)**.

- [x] **Profil Firmy w Google** — przejęty 23.07.2026 (wizytówka: https://maps.google.com/?cid=12276542814275745116, dodana do `sameAs` na stronie). Do zrobienia w profilu: kategoria *Architekt wnętrz*, usługi, zdjęcia projektów, link do strony (z UTM), Warszawa jako obszar obsługi. Potem **proś byłych klientów o opinie, które wymieniają usługę i miasto** („projekt wnętrza mieszkania we Wrocławiu") — treść opinii bywa cytowana w odpowiedziach AI.
- [ ] **Foursquare** — formularz przejęcia (https://business.foursquare.com/claim/?new_search=true; stary link location.foursquare.com nie działa) nie znajdował miejsc spoza USA przy próbie 23.07.2026. Obejście: utwórz miejsce przez aplikację **Swarm** (dodawanie miejsc działa globalnie i jest darmowe) z pełnym NAP `kool studio, Zaporoska 83/15, Wrocław`, kategoria Design Studio — *dla ChatGPT liczy się samo istnienie miejsca w danych Foursquare; płatne przejęcie (~20 USD) służy tylko do zarządzania i może poczekać.* Co jakiś czas ponów próbę przejęcia.
- [x] **Bing Places** — założone 23.07.2026 (Bing Webmaster Tools zweryfikowany tego samego dnia). Publiczna wizytówka w Bing Maps jeszcze niewidoczna — nowe wpisy publikują się do ok. tygodnia; gdy się pojawi, zapisz jej adres do `sameAs`.
- [ ] **Apple Business** — https://businessconnect.apple.com. *Odłożone (decyzja 23.07.2026).* Zasila Apple Maps, Siri i Apple Intelligence; tania przewaga, gdy temat wróci.

## 3. Katalogi branżowe i platformy portfolio

- [ ] **Profil profesjonalisty na Homebook.pl** — największy polski katalog wnętrzarski z podstronami „architekci / projektanci wnętrz" filtrowanymi po mieście (Wrocław i Warszawa). Uzupełnij profil + wgraj całe portfolio z polskimi opisami. To też ścieżka do dorocznego albumu **Homebook Design**.
- [ ] **Archello** (darmowe, samodzielna publikacja) — https://archello.com — profil studia + wszystkie projekty z opisami **po angielsku**, wymieniającymi Wrocław i Warszawę. Wysokoautorytatywne anglojęzyczne źródło cytowane przy zapytaniach „interior designer Poland/Warsaw".
- [ ] **Architonic** — profil pracowni, te same angielskie teksty.
- [ ] **Houzz** (niższy priorytet) — darmowy profil, opis PL + EN; płatne pakiety pomiń.

## 4. Prasa (najsilniejszy zmierzony sygnał)

Wzmianki o marce w zaufanych mediach korelują z obecnością w odpowiedziach AI ~3× mocniej niż backlinki. Studio ma już publikacje w Label Magazine, WhiteMAD i PLNdesign — utrzymaj ten rytm:

- [ ] Dla każdego ukończonego projektu: profesjonalne zdjęcia + krótki polski press kit (historia, miasto, metraż, materiały, współprace), wysyłany do **whitemad.pl, Label Magazine, Magazif, Domosfera, Czas na Wnętrze, Elle Decoration Polska**. Cel: 2–4 publikacje rocznie.
- [ ] Zgłoszenie do dorocznego albumu **Homebook Design**.
- [ ] Najmocniejszy, najlepiej sfotografowany projekt: **ArchDaily** (https://www.archdaily.com/submit-a-project — min. 15 zdjęć 2880px+, narracja po angielsku) i pitch do **Dezeen**. Jedna akceptacja = trwała wzmianka o wysokim autorytecie.
- [ ] Proś dziennikarzy, by w treści artykułu padała nazwa „kool studio" **wraz z miastem**.

## 5. Social media jako powierzchnia dla crawlerów AI

- [ ] **Instagram** — konto publiczne/profesjonalne; bio jak wizytówka encji: „Architektura wnętrz — Wrocław / Warszawa" + link koolstudio.pl. Pisz podpisy, które **tekstem** wymieniają miasto i usługę (po polsku + jedna linijka po angielsku) — posty składające się z samych zdjęć są niewidoczne dla wyszukiwania. Instagram jest obecnie #1 źródłem społecznościowym w odpowiedziach ChatGPT.
- [ ] **Pinterest** — tablice per projekt z opisowymi tytułami/opisami linkującymi do podstron projektów na koolstudio.pl.

## 6. Później (po 2–3 publikacjach prasowych)

- [ ] **Rekord w Wikidata** dla kool studio (instancja: pracownia projektowania wnętrz; siedziba: Wrocław; oficjalna strona; źródła: adresy publikacji prasowych). Zasila Google Knowledge Graph i warstwy encji LLM-ów; typowe opóźnienie panelu wiedzy to 2–6 miesięcy.
- [ ] Dodaj adres każdego przejętego profilu (Foursquare, Homebook, Archello, Architonic, Pinterest, Wikidata, Bing Maps po publikacji) do tablicy `sameAs` w JSON-LD strony w `app/[locale]/layout.tsx` — Instagram + Facebook (https://www.facebook.com/its.kool.studio) + Google Maps dodane 23.07.2026.
- [ ] Rozważ odłożoną na później **sekcję FAQ** (oferta/kontakt) ze schematem FAQPage — FAQ + rozbudowany schema dawały ~44% więcej cytowań AI; ludzie pytają asystentów o „ile kosztuje projekt wnętrz we Wrocławiu", „czy pracujecie w Warszawie", „jak długo trwa projekt".

## 7. Pomiar (co miesiąc, 15 minut)

- [ ] Zapytaj Claude'a, ChatGPT i Perplexity (po polsku i angielsku): „architekt wnętrz Wrocław", „polecany projektant wnętrz Wrocław", „interior designer Warsaw Poland" — zanotuj, czy kool studio się pojawia i **jakie źródła są cytowane**; wysiłek kolejnego miesiąca kieruj w te źródła.
- [ ] Sprawdź raport **AI Performance** w Bing Webmaster i `site:koolstudio.pl` w Brave.

### Uwagi

- `llms.txt` jest teraz generowany z `data/projects.ts` (poprawne założycielki, wszystkie projekty, linki markdown) — zmierzone wykorzystanie llms.txt przez crawlery jest bliskie zera, więc traktuj go jako bezkosztowe zabezpieczenie, nie strategię. Liczą się indeksowalne strony HTML.
- Przekierowanie www→apex jest już skonfigurowane (lipiec 2026). Pamiętaj przy przyszłych regułach `Disallow` w robots.txt: grupa wildcard obejmuje też wszystkie crawlery AI.
