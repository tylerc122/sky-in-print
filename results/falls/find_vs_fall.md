# Catalogued US finds that newspapers may show as falls (2026-10-27)

`src/skyinprint/find_vs_fall.py` follows the Thomson pattern.
- **Input:** every Valid US find in the frozen snapshot from 1770 to 1964 (707 meteorites).
- **Matching:** each find is checked against candidate articles from two years before to one year after its find
  year.
  - Name matching tolerates OCR errors (split letters, m read as rn).
  - The article must name the find's state or be printed there.
  - The meteorite's name must fall within 600 characters of a meteor word.
- **Scoring:** each passage is scored for fall language (fell, heard, hot, buried, saw it) and for debunking language.
- **Output:** data/sweep/find_vs_fall.json.

## Result

- 74 of 707 finds are named near a meteor word in their window. Most are coincidences: city names (Kansas City,
  Cincinnati, York), "Tell" as an ordinary word, and storms or unrelated fireballs.
- **Positive control:** Thomson is recovered. The top article is the Savannah Morning News of 1888-11-07, with "heard
  ... whizzing ... burrowed". The OCR spells the town "Thorn son" in the headline. The first version of the matcher
  missed this; the OCR tolerance was added for it.
- Hits that are not candidates:
  - Goose Lake, Navajo, Winona, Coon Butte: old finds; the articles describe prehistoric falls or the crater.
  - Roy (1933): the 24 Mar 1933 fireball that ended "near Roy, N.M." is the Pasamonte fall (a eucrite). Roy is an L5,
    a different meteorite.
  - Anthony, Tell, New Mexico, Cincinnati, Kansas City, York: the name coincides with unrelated text.

## New lead: Kimble County (H6, 153.8 kg, found 1918) and the Texas fireball of 1 Oct 1917

- **J. A. Udden, "A Texas Meteor", Science 46:616-617 (21 Dec 1917)**, free as JSTOR Early Journal Content
  (archive.org jstor-1643234).
  - About 10:30 p.m. on 1 Oct 1917; seen across Texas; NE to SW path; ended in an explosion.
  - Thunder was heard 3-5 minutes later over about 150 miles north of Bandera County, "strong enough to shake
    buildings" at Brady. A dust cloud was seen for 40 minutes.
  - Udden: "the place where this aerolite fell must be somewhere in or near Kimble County." The roughly 60
    observers' directions converge there.
  - He followed up with UT Bulletin 1772, "The Texas Meteor of October 1, 1917" (56 pp.). Not read yet.
- Our corpus has only the syndicated account of Udden's method (Washington Times 1918-03-16 p.15 and reprints): "it
  must be somewhere within that area that the meteor, or its fragments, struck the earth and there they may some
  time be found." There is no 1917-1920 report of a stone being found.
- **Catalogue (frozen snapshot):**
  - Kimble County: H6, 153,800 g, Found 1918, 30.417 N, 99.400 W.
  - Junction: L5, 241 g, Found 1932, 30.500 N, 99.833 W.
  - Both lie in the predicted county.
- **TCU Oscar Monnig papers (MS 124), Series III, Box 06:**
  - Folder "Junction - Oct. 1, 1917 - Kimble County, 1937-1948" holds Udden's 1918 article, filed as "Junction
    meteorite". It also holds undated notes on the Junction stone with microprobe tables dated 6/28/84. Those give
    olivine Fa about 24-25 and pyroxene Fs about 21, which is L-group, matching the L5 Junction stone.
  - Folder "Kimble County, Texas - Jobes Ranch, 1957" holds letters from A. R. Allen (8 Jun 1957, with a map) and
    E. P. Henderson (Smithsonian, 25 Jul 1957) to Monnig about the Kimble County meteorite.
  - So Monnig appears to have tied the 1917 fireball to the Junction stone, while Kimble County was a separate 1957
    file.
- **Assessment: a lead, not a case.**
  - Unlike Thomson, nobody is known to have seen either stone fall. Linking them to the fireball would rest on place
    and timing only. The Nomenclature Committee is unlikely to accept that without more, such as a 1917-18 recovery
    account or a weathering/terrestrial-age argument.
  - A 153.8 kg H6 found the year after a large detonating fireball, in the county the observers converge on, is still
    worth asking about.
  - Junction (241 g, found 15 years later) is weaker on timing. Monnig evidently looked at it.
- **To check by hand:**
  - MBDB entries for Kimble County and Junction: the find circumstances and any "possibly associated with the fall of
    1 Oct 1917" note.
  - The Udden 1772 bulletin.
  - The 1957 Allen and Henderson letters, which are digitized in the TCU repository.
  - Texas papers for Oct 1917 to 1918. Junction and Brady papers are not in our corpus; the Portal to Texas History
    may have them.
