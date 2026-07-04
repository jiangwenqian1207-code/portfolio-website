# Jiang Wenqian Portfolio Media Guide

This folder is cleaned and renamed for portfolio website building in Codex.

## Structure
- `public/images/profile/` : personal photos
- `public/images/projects/` : still images grouped by project
- `public/videos/projects/` : project videos grouped by project
- `public/documents/` : downloadable resume
- `public/images/references/` : supporting reference image

## Main project folders
- `newrank-ui-design` : UI design work for Newrank
- `xgimi-visual-marketing` : visual marketing work for XGIMI
- `school-course-projects` : academic and course projects

## Recommended usage in a portfolio site
- Home page hero / about card:
  - `public/images/profile/profile-photo.jpg`
- Resume download:
  - `public/documents/resume-jiang-wenqian.pdf`
- Featured commercial projects:
  - `public/images/projects/newrank-ui-design/`
  - `public/images/projects/xgimi-visual-marketing/`
- Featured academic projects:
  - `public/images/projects/school-course-projects/01-shu-brocade-floral-patterns/`
  - `public/images/projects/school-course-projects/03-3d-modeling-and-video/`
- Project videos:
  - `public/videos/projects/school-course-projects/03-3d-modeling-and-video/healing-garden/`
  - `public/videos/projects/school-course-projects/03-3d-modeling-and-video/sky-garden/`

## Notes for Codex / AI builders
- Prefer real assets in `public/` instead of placeholder images.
- Keep filenames and paths unchanged when writing code.
- Do not stretch images; use object-fit or responsive containers.
- For videos, default to muted playback and add poster images if needed.
- Use `file-name-map.csv` if you need to trace any renamed file back to the original Chinese source name.
