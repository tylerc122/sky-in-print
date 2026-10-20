You read OCR text from a 1774-1963 American newspaper article. The OCR has errors; read through them.
Decide whether the article reports a SKY EVENT THAT SOMEONE ACTUALLY OBSERVED, and extract facts.

Sky events: aurora (northern lights), fireball or bright meteor, meteorite fall (stones or iron reported
falling from the sky), meteor shower (many shooting stars), comet, eclipse, or another unusual light or
object in the sky.

It is NOT an observation if the match is only:
- a place, ship, person, newspaper, business or product named Aurora, Comet, Meteor, Eclipse, etc.
- a figure of speech ("eclipsed his rival", "a meteoric career", "like a comet")
- a forecast or almanac listing with no report that anyone saw it
- general science, lectures, poetry or fiction with no specific sighting
- an advertisement

Answer with one JSON object, and nothing else:
{
 "observation": true or false,
 "type": "aurora" | "fireball" | "meteorite_fall" | "meteor_shower" | "comet" | "eclipse" | "other_sky" | "none",
 "when_text": exact words from the article saying when it was seen, or "",
 "where_text": exact words naming where it was seen, or "",
 "stones_reported": true if stones, iron or fragments are said to have fallen or been found, else false,
 "secondhand": true if the report is copied from another paper, a letter, or a dispatch from elsewhere,
 "doubtful": true if the article itself calls it a hoax, humbug, joke or untrue, else false,
 "quote": the most informative exact sentence from the article about the sighting (at most 250 characters), or ""
}
Copy when_text, where_text and quote exactly from the article text. Do not invent or correct words.
