import { useEffect, useMemo, useRef, useState } from 'react'

const DATA_URL = '/data/professionals.json'

const initialFilters = {
  search: '',
  area: 'Todas',
  location: 'Todas',
  tech: 'Todas',
}

function useDarkMode() {
  const getInitialPreference = () => {
    if (typeof window === 'undefined') return false
    const stored = window.localStorage.getItem('gs-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  }

  const [isDark, setIsDark] = useState(getInitialPreference)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      window.localStorage.setItem('gs-theme', 'dark')
    } else {
      root.classList.remove('dark')
      window.localStorage.setItem('gs-theme', 'light')
    }
  }, [isDark])

  return [isDark, () => setIsDark((prev) => !prev)]
}

function App() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [messageTarget, setMessageTarget] = useState(null)
  const [recommendations, setRecommendations] = useState({})
  const [toast, setToast] = useState(null)
  const [isDark, toggleTheme] = useDarkMode()
  const toastTimeoutRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Não foi possível carregar os perfis.')
        return response.json()
      })
      .then((data) => {
        if (isMounted) {
          setProfiles(data)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Erro ao carregar os perfis. Tente novamente.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const totalAreas = new Set(profiles.map((profile) => profile.area)).size
    const totalCities = new Set(profiles.map((profile) => profile.localizacao)).size
    const totalSkills = new Set(
      profiles.flatMap((profile) => profile.habilidadesTecnicas),
    ).size

    return {
      totalProfiles: profiles.length,
      totalAreas,
      totalCities,
      totalSkills,
    }
  }, [profiles])

  const options = useMemo(() => {
    const areas = Array.from(new Set(profiles.map((profile) => profile.area))).sort()
    const locations = Array.from(
      new Set(profiles.map((profile) => profile.localizacao)),
    ).sort()
    const techs = Array.from(
      new Set(profiles.flatMap((profile) => profile.habilidadesTecnicas)),
    ).sort()

    return { areas, locations, techs }
  }, [profiles])

  const filteredProfiles = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase()
    return profiles.filter((profile) => {
      const matchesSearch =
        !searchTerm ||
        [profile.nome, profile.cargo, profile.resumo]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm) ||
        profile.habilidadesTecnicas.some((skill) =>
          skill.toLowerCase().includes(searchTerm),
        )

      const matchesArea = filters.area === 'Todas' || profile.area === filters.area
      const matchesLocation =
        filters.location === 'Todas' || profile.localizacao === filters.location
      const matchesTech =
        filters.tech === 'Todas' ||
        profile.habilidadesTecnicas.some((skill) => skill === filters.tech)

      return matchesSearch && matchesArea && matchesLocation && matchesTech
    })
  }, [profiles, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => setFilters(initialFilters)

  const handleRecommend = (profile) => {
    setRecommendations((prev) => ({
      ...prev,
      [profile.id]: (prev[profile.id] ?? 0) + 1,
    }))
    triggerToast(`Você recomendou ${profile.nome}!`)
  }

  const handleSendMessage = (event, profile) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const subject = formData.get('subject')?.toString().trim()
    const message = formData.get('message')?.toString().trim()

    if (!subject || !message) {
      triggerToast('Preencha assunto e mensagem para enviar.')
      return
    }

    triggerToast(`Mensagem enviada para ${profile.nome}!`)
    event.currentTarget.reset()
    setMessageTarget(null)
  }

  const triggerToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToast(message)
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, 4000)
  }

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const handleOpenProfile = (profile) => {
    setSelectedProfile(profile)
    setMessageTarget(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-lg shadow-brand-500/5 backdrop-blur-md dark:bg-slate-900/70 dark:shadow-brand-400/10 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-50/80 px-4 py-1 text-sm font-medium text-brand-700 dark:bg-brand-400/15 dark:text-brand-200">
                2º Semestre 2025 · Global Solution · Front-End
              </p>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
                  Futuro do Trabalho · Rede Colaborativa
                </h1>
                <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
                  Experimente uma plataforma inspirada no LinkedIn para conectar talentos, competências e propósitos.
                  Explore perfis, filtre por áreas de atuação, recomende profissionais e envie mensagens com poucos cliques.
                </p>
              </div>
            </div>
            <DarkModeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
          <StatsBar stats={stats} />
          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={clearFilters}
            areas={options.areas}
            locations={options.locations}
            techs={options.techs}
          />
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                Profissionais em destaque
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loading
                  ? 'Carregando perfis fictícios...'
                  : `${filteredProfiles.length} perfis disponíveis para conexão`}
              </p>
            </div>
            <ActiveFiltersBadge filters={filters} onClear={clearFilters} />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-100">
              {error}
            </p>
          )}

          {loading ? (
            <SkeletonGrid />
          ) : filteredProfiles.length === 0 ? (
            <EmptyState onReset={clearFilters} />
          ) : (
            <ProfileGrid
              profiles={filteredProfiles}
              onSelect={handleOpenProfile}
              recommendations={recommendations}
            />
          )}
        </section>
      </div>

      <ProfileModal
        profile={selectedProfile}
        recommendations={recommendations}
        onClose={() => {
          setSelectedProfile(null)
          setMessageTarget(null)
        }}
        onRecommend={handleRecommend}
        messageTarget={messageTarget}
        onMessageToggle={setMessageTarget}
        onMessageSubmit={handleSendMessage}
      />

      <Toast message={toast} />
    </div>
  )
}

function DarkModeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-brand-200"
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
          isDark ? 'bg-slate-900 text-amber-300' : 'bg-slate-100 text-slate-900'
        } transition`}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
      {isDark ? 'Modo claro' : 'Modo escuro'}
    </button>
  )
}

function StatsBar({ stats }) {
  const cards = [
    { label: 'Talentos ativos', value: stats.totalProfiles },
    { label: 'Áreas de atuação', value: stats.totalAreas },
    { label: 'Cidades', value: stats.totalCities },
    { label: 'Tecnologias mapeadas', value: stats.totalSkills },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900/70"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {card.value || '—'}
          </p>
        </article>
      ))}
    </div>
  )
}

function FilterControls({
  filters,
  onFilterChange,
  onClear,
  areas,
  locations,
  techs,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
        Busca rápida
        <input
          type="search"
          placeholder="Busque por nome, cargo ou skill"
          value={filters.search}
          onChange={(event) => onFilterChange('search', event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-inner focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <SelectField
        label="Área"
        value={filters.area}
        onChange={(value) => onFilterChange('area', value)}
        options={areas}
      />
      <SelectField
        label="Cidade"
        value={filters.location}
        onChange={(value) => onFilterChange('location', value)}
        options={locations}
      />
      <SelectField
        label="Tecnologia"
        value={filters.tech}
        onChange={(value) => onFilterChange('tech', value)}
        options={techs}
      />

      <button
        type="button"
        onClick={onClear}
        className="md:col-span-2 lg:col-span-4 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-200"
      >
        Limpar filtros
      </button>
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="Todas">Todas</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ActiveFiltersBadge({ filters, onClear }) {
  const labelMap = {
    area: 'Área',
    location: 'Cidade',
    tech: 'Tecnologia',
  }

  const activeFilters = Object.entries(filters).filter(([key, value]) =>
    key === 'search' ? value.trim() !== '' : value !== 'Todas',
  )

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-200"
        >
          {key === 'search' ? `Busca: ${value}` : `${labelMap[key]}: ${value}`}
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-300"
      >
        limpar
      </button>
    </div>
  )
}

function ProfileGrid({ profiles, onSelect, recommendations }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onSelect={() => onSelect(profile)}
          recommendationsCount={recommendations[profile.id] ?? 0}
        />
      ))}
    </div>
  )
}

function ProfileCard({ profile, onSelect, recommendationsCount }) {
  return (
    <article className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center gap-4">
        <img
          src={profile.foto}
          alt={`Foto de ${profile.nome}`}
          className="h-16 w-16 rounded-2xl border border-slate-100 bg-slate-50 object-cover dark:border-slate-700"
        />
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {profile.nome}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.cargo}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {profile.localizacao} • {profile.area}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
        {profile.resumo}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {profile.habilidadesTecnicas.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {skill}
          </span>
        ))}
        {profile.habilidadesTecnicas.length > 4 && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            +{profile.habilidadesTecnicas.length - 4}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>{recommendationsCount} recomendações</span>
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex items-center gap-2 text-brand-600 transition hover:gap-3"
        >
          Ver perfil →
        </button>
      </div>
    </article>
  )
}

function ProfileModal({
  profile,
  recommendations,
  onClose,
  onRecommend,
  messageTarget,
  onMessageToggle,
  onMessageSubmit,
}) {
  if (!profile) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-10 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400"
          aria-label="Fechar modal"
        >
          ✕
        </button>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <img
              src={profile.foto}
              alt={`Foto de ${profile.nome}`}
              className="h-24 w-24 rounded-3xl border border-slate-200 object-cover dark:border-slate-700"
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                {profile.area}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {profile.nome}
              </h2>
              <p className="text-slate-500 dark:text-slate-300">{profile.cargo}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profile.localizacao} • {recommendations[profile.id] ?? 0} recomendações
              </p>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300">{profile.resumo}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {profile.softSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onRecommend(profile)}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand-500"
              >
                Recomendar profissional
              </button>
              <button
                type="button"
                onClick={() =>
                  onMessageToggle((prev) => (prev === profile.id ? null : profile.id))
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-200"
              >
                Enviar mensagem
              </button>
            </div>
          </div>

          <Section title="Habilidades técnicas">
            <div className="flex flex-wrap gap-2">
              {profile.habilidadesTecnicas.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Experiências profissionais">
            <div className="space-y-4">
              {profile.experiencias.map((experience) => (
                <article
                  key={`${experience.empresa}-${experience.inicio}`}
                  className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
                >
                  <p className="text-sm font-semibold text-brand-600 dark:text-brand-200">
                    {experience.empresa}
                  </p>
                  <p className="text-slate-800 dark:text-white">{experience.cargo}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {experience.inicio} – {experience.fim}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {experience.descricao}
                  </p>
                </article>
              ))}
            </div>
          </Section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Formação acadêmica">
              {profile.formacao.map((formacao) => (
                <div key={formacao.curso}>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {formacao.curso}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formacao.instituicao} · {formacao.ano}
                  </p>
                </div>
              ))}
            </Section>

            <Section title="Certificações">
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {profile.certificacoes.map((cert) => (
                  <li key={cert}>{cert}</li>
                ))}
              </ul>
            </Section>
          </div>

          <Section title="Projetos de impacto">
            <div className="grid gap-4 md:grid-cols-2">
              {profile.projetos.map((projeto) => (
                <a
                  key={projeto.titulo}
                  href={projeto.link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-slate-100 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-800 dark:hover:border-brand-400/50"
                >
                  <p className="text-sm font-semibold text-brand-600 dark:text-brand-200">
                    {projeto.titulo}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {projeto.descricao}
                  </p>
                </a>
              ))}
            </div>
          </Section>

          <Section title="Idiomas e interesses">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Idiomas
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {profile.idiomas.map((idioma) => (
                    <li key={`${idioma.idioma}-${idioma.nivel}`}>
                      {idioma.idioma} · {idioma.nivel}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Interesses
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.areaInteresses.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Soft skills & hobbies">
            <div className="flex flex-wrap gap-2">
              {profile.hobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </Section>

          {messageTarget === profile.id && (
            <section className="rounded-3xl border border-brand-100 bg-brand-50/50 p-6 dark:border-brand-500/40 dark:bg-brand-500/5">
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-200">
                Enviar mensagem para {profile.nome}
              </p>
              <form className="mt-4 space-y-3" onSubmit={(event) => onMessageSubmit(event, profile)}>
                <label className="block text-xs font-semibold uppercase text-brand-600 dark:text-brand-200">
                  Assunto
                  <input
                    type="text"
                    name="subject"
                    placeholder="Convite para colaboração"
                    className="mt-1 w-full rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none dark:border-brand-400/50 dark:bg-slate-900 dark:text-slate-100"
                    required
                  />
                </label>
                <label className="block text-xs font-semibold uppercase text-brand-600 dark:text-brand-200">
                  Mensagem
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Compartilhe sua proposta de projeto ou oportunidade..."
                    className="mt-1 w-full rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none dark:border-brand-400/50 dark:bg-slate-900 dark:text-slate-100"
                    required
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand-500"
                  >
                    Enviar agora
                  </button>
                  <button
                    type="button"
                    onClick={() => onMessageToggle(null)}
                    className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-100 p-5 dark:border-slate-800">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        Nenhum perfil encontrado
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Ajuste a busca ou redefina os filtros para explorar outros profissionais.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-2xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-200"
      >
        Limpar filtros
      </button>
    </div>
  )
}

function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-xl dark:bg-slate-800">
      {message}
    </div>
  )
}

export default App
