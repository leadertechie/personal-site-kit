import { css } from 'lit';

export const aboutmeStyles = css`
:host {
  display: block;
}

.aboutme {
  display: block;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.aboutme h2 {
  color: var(--link-color);
  margin-bottom: 15px;
  font-size: 2em;
}

.aboutme h3 {
  color: var(--link-color);
  margin-bottom: 10px;
}

.aboutme p {
  margin-bottom: 10px;
  text-align: left;
}

.aboutme ul {
  list-style-type: disc;
  margin-left: 20px;
  text-align: left;
}

.aboutme li {
  margin-bottom: 5px;
}

.aboutme .profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  border: 3px solid var(--link-color);
  box-shadow: 
    0 0 0 4px var(--link-color),
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 12px 24px rgba(0, 0, 0, 0.15);
}

.aboutme .profile-section {
  text-align: center;
  background: var(--card-bg, var(--background-color, #fff));
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 10px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.aboutme .profile-title {
  color: var(--secondary-text, #666);
  margin-bottom: 0;
  text-align: center;
}

.aboutme h1 {
  margin-bottom: 0.5rem;
}

.aboutme .loading {
  text-align: center;
  padding: 20px;
  color: var(--text-color);
}

.aboutme .content-section {
  font-family: Arial, sans-serif;
}
`;
