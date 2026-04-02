function CustomizationPage({
  profile,
  petProfile,
  avatarClasses,
  hairStyles,
  outfitStyles,
  petSpecies,
  petColors,
  petAuras,
  onUpdateAvatarField,
  onUpdatePetField,
}) {
  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Avatar and Pet Customization</h2>
        <span>{petProfile.evolution} Lv {petProfile.level}</span>
      </div>

      <div className="feature-grid">
        <article className="panel">
          <h3>Character</h3>
          <div className="avatar-preview">
            <div className="avatar-circle">🧙</div>
            <div>
              <strong>{profile.name}</strong>
              <p>{profile.className}</p>
            </div>
          </div>
          <div className="stack-form">
            <input value={profile.name} onChange={(event) => onUpdateAvatarField("name", event.target.value)} />
            <select value={profile.className} onChange={(event) => onUpdateAvatarField("className", event.target.value)}>
              {avatarClasses.map((className) => <option key={className}>{className}</option>)}
            </select>
            <select value={profile.hair} onChange={(event) => onUpdateAvatarField("hair", event.target.value)}>
              {hairStyles.map((style) => <option key={style}>{style}</option>)}
            </select>
            <select value={profile.outfit} onChange={(event) => onUpdateAvatarField("outfit", event.target.value)}>
              {outfitStyles.map((style) => <option key={style}>{style}</option>)}
            </select>
          </div>
        </article>

        <article className="panel">
          <h3>Pet Stable</h3>
          <div className="avatar-preview">
            <div className="avatar-circle">🐾</div>
            <div>
              <strong>{petProfile.species}</strong>
              <p>{petProfile.evolution}</p>
            </div>
          </div>
          <div className="stack-form">
            <select value={petProfile.species} onChange={(event) => onUpdatePetField("species", event.target.value)}>
              {petSpecies.map((species) => <option key={species}>{species}</option>)}
            </select>
            <select value={petProfile.color} onChange={(event) => onUpdatePetField("color", event.target.value)}>
              {petColors.map((color) => <option key={color}>{color}</option>)}
            </select>
            <select value={petProfile.aura} onChange={(event) => onUpdatePetField("aura", event.target.value)}>
              {petAuras.map((aura) => <option key={aura}>{aura}</option>)}
            </select>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${petProfile.xp}%` }} />
          </div>
          <p>{petProfile.xp}/100 XP</p>
        </article>
      </div>
    </section>
  );
}

export default CustomizationPage;
