import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Save, RotateCcw, Link2, Move, Trash2, Rocket, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { ROLES, getCategoryTheme } from '../../utils/constants'
import { questApi } from '../../api/questApi'
import { useQuestMap } from '../../hooks/useQuestMap'
import { edgeKey, findUnreachable } from '../../utils/mapEditor'
import EditorCanvas from '../../components/quest/EditorCanvas'

function buildNodes(data) {
  return (data.nodes || []).map((n) => ({
    problemId: n.problemId,
    x: n.x,
    y: n.y,
    start: !!n.start,
    nodeIcon: n.nodeIcon ?? null,
    orderIndex: n.orderIndex,
    xpReward: n.xpReward,
    categoryName: n.categoryName,
    mainCategoryName: n.mainCategoryName,
  }))
}

function buildEdges(data) {
  const seen = new Set()
  const out = []
  ;(data.edges || []).forEach((e) => {
    if (e.from === e.to) return
    const key = edgeKey(e.from, e.to)
    if (seen.has(key)) return
    seen.add(key)
    out.push({ from: e.from, to: e.to })
  })
  return out
}

const snapshot = (nodes, edges) =>
  JSON.stringify([
    nodes.map((n) => [n.problemId, n.x, n.y, n.start]),
    edges.map((e) => edgeKey(e.from, e.to)).sort(),
  ])

function EditorBody({ questId, data, published }) {
  const queryClient = useQueryClient()
  const [initialNodes] = useState(() => buildNodes(data))
  const [initialEdges] = useState(() => buildEdges(data))
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [mode, setMode] = useState('move')
  const [selectedId, setSelectedId] = useState(null)
  const [selectedEdgeKey, setSelectedEdgeKey] = useState(null)
  const [linkFromId, setLinkFromId] = useState(null)

  const { width, height } = useMemo(() => {
    const maxX = Math.max(0, ...initialNodes.map((n) => n.x))
    const maxY = Math.max(0, ...initialNodes.map((n) => n.y))
    return {
      width: Math.max(1200, maxX + 120),
      height: Math.max(700, maxY + 120),
    }
  }, [initialNodes])

  const dirty = useMemo(
    () => snapshot(nodes, edges) !== snapshot(initialNodes, initialEdges),
    [nodes, edges, initialNodes, initialEdges]
  )

  const noStart = !nodes.some((n) => n.start)
  const unreachable = useMemo(
    () => (noStart ? [] : findUnreachable(nodes, edges)),
    [nodes, edges, noStart]
  )
  const issues = []
  if (noStart) issues.push('Mark at least one start node')
  if (unreachable.length) {
    issues.push(`Not reachable from a start: ${unreachable.map((id) => `#${id}`).join(', ')}`)
  }
  const valid = issues.length === 0

  const selected = nodes.find((n) => n.problemId === selectedId) || null
  const selectedEdge = selectedEdgeKey
    ? edges.find((e) => edgeKey(e.from, e.to) === selectedEdgeKey) || null
    : null

  const moveNode = (problemId, x, y) =>
    setNodes((prev) => prev.map((n) => (n.problemId === problemId ? { ...n, x, y } : n)))

  const toggleStart = (problemId) =>
    setNodes((prev) =>
      prev.map((n) => (n.problemId === problemId ? { ...n, start: !n.start } : n))
    )

  const clearSelection = () => {
    setSelectedId(null)
    setSelectedEdgeKey(null)
  }

  const selectNode = (id) => {
    setSelectedId(id)
    setSelectedEdgeKey(null)
  }

  const selectEdge = (key) => {
    setSelectedEdgeKey(key)
    setSelectedId(null)
  }

  const changeMode = (next) => {
    setMode(next)
    setLinkFromId(null)
  }

  const handleLinkPick = (id) => {
    if (linkFromId === null) {
      setLinkFromId(id)
      return
    }
    if (linkFromId === id) {
      setLinkFromId(null)
      return
    }
    const key = edgeKey(linkFromId, id)
    setEdges((prev) =>
      prev.some((e) => edgeKey(e.from, e.to) === key)
        ? prev.filter((e) => edgeKey(e.from, e.to) !== key)
        : [...prev, { from: linkFromId, to: id }]
    )
    setLinkFromId(null)
  }

  const removeSelectedEdge = () => {
    setEdges((prev) => prev.filter((e) => edgeKey(e.from, e.to) !== selectedEdgeKey))
    setSelectedEdgeKey(null)
  }

  const reset = () => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    clearSelection()
    setLinkFromId(null)
  }

  const saveMutation = useMutation({
    mutationFn: (payload) => questApi.updateMap(questId, payload),
    onSuccess: () => {
      toast.success('Map saved')
      queryClient.invalidateQueries({ queryKey: ['quest-map'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Could not save the map')
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => questApi.publish(questId),
    onSuccess: () => {
      toast.success('Quest published')
      queryClient.invalidateQueries({ queryKey: ['quest', String(questId)] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Could not publish the quest')
    },
  })

  const handleSave = () => {
    saveMutation.mutate({
      nodes: nodes.map((n) => ({
        problemId: n.problemId,
        x: Math.round(n.x),
        y: Math.round(n.y),
        start: !!n.start,
        ...(n.nodeIcon ? { nodeIcon: n.nodeIcon } : {}),
      })),
      edges: edges.map((e) => ({ from: e.from, to: e.to })),
    })
  }

  const busy = saveMutation.isPending || publishMutation.isPending

  return (
    <div className="space-y-4">
      <Link
        to={`/quests/${questId}`}
        className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Back to map
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Edit map: {data.title}</h1>
            {published === true && <span className="badge badge-success">Published</span>}
            {published === false && <span className="badge badge-warning">Draft</span>}
          </div>
          <p className="text-sm opacity-70">
            {nodes.length} locations · {edges.length} links
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dirty && <span className="text-sm text-amber-300">Unsaved changes</span>}
          <button
            className="btn-secondary inline-flex items-center gap-1"
            disabled={!dirty || busy}
            onClick={reset}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            className="btn-primary inline-flex items-center gap-1"
            disabled={!dirty || !valid || busy}
            onClick={handleSave}
          >
            <Save size={15} /> {saveMutation.isPending ? 'Saving…' : 'Save map'}
          </button>
          {published === false && (
            <button
              className="btn-primary inline-flex items-center gap-1"
              disabled={dirty || !valid || busy}
              title={dirty ? 'Save your changes first' : undefined}
              onClick={() => publishMutation.mutate()}
            >
              <Rocket size={15} /> {publishMutation.isPending ? 'Publishing…' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`${mode === 'move' ? 'btn-primary' : 'btn-secondary'} inline-flex items-center gap-1`}
          onClick={() => changeMode('move')}
        >
          <Move size={15} /> Move
        </button>
        <button
          className={`${mode === 'link' ? 'btn-primary' : 'btn-secondary'} inline-flex items-center gap-1`}
          onClick={() => changeMode('link')}
        >
          <Link2 size={15} /> Link
        </button>
        <span className="text-sm opacity-70">
          {mode === 'move'
            ? 'Drag locations to move them. Click a link to select it.'
            : linkFromId === null
              ? 'Click a location, then another one, to add or remove a link.'
              : `Linking from #${linkFromId}. Click the second location (click it again to cancel).`}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="card p-2 overflow-auto">
          <EditorCanvas
            nodes={nodes}
            edges={edges}
            width={width}
            height={height}
            mode={mode}
            selectedId={selectedId}
            selectedEdgeKey={selectedEdgeKey}
            linkFromId={linkFromId}
            unreachable={unreachable}
            onSelectNode={selectNode}
            onSelectEdge={selectEdge}
            onClearSelection={clearSelection}
            onMove={moveNode}
            onLinkPick={handleLinkPick}
          />
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-2 h-fit">
            <p className="font-semibold text-sm">Checks</p>
            {valid ? (
              <p className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 size={16} /> Map is valid
              </p>
            ) : (
              issues.map((msg) => (
                <p key={msg} className="flex items-start gap-2 text-sm text-red-300">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {msg}
                </p>
              ))
            )}
          </div>

          <div className="card p-4 space-y-3 h-fit">
            {selectedEdge ? (
              <>
                <p className="font-semibold">
                  Link #{selectedEdge.from} ↔ #{selectedEdge.to}
                </p>
                <button
                  className="btn-secondary inline-flex items-center gap-1"
                  onClick={removeSelectedEdge}
                >
                  <Trash2 size={15} /> Remove link
                </button>
              </>
            ) : selected ? (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: getCategoryTheme(selected.mainCategoryName).color }}
                  />
                  <span className="font-semibold">Problem #{selected.problemId}</span>
                </div>
                <p className="text-sm opacity-80">
                  {selected.mainCategoryName}
                  {selected.categoryName && selected.categoryName !== selected.mainCategoryName
                    ? ` · ${selected.categoryName}`
                    : ''}
                </p>
                <p className="text-sm opacity-70">
                  Order {selected.orderIndex} · {selected.xpReward} XP
                </p>
                <p className="text-sm opacity-70">
                  Position {selected.x}, {selected.y}
                </p>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.start}
                    onChange={() => toggleStart(selected.problemId)}
                  />
                  Start node
                </label>
              </>
            ) : (
              <p className="text-sm opacity-70">
                Click a location or a link to see its details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuestMapEditorPage() {
  const { id } = useParams()
  const role = useAuthStore((s) => s.user?.role)
  const isStaff = role === ROLES.ADMIN || role === ROLES.TEACHER

  const { data, isLoading, isError, error, dataUpdatedAt } = useQuestMap(id)
  const questQuery = useQuery({
    queryKey: ['quest', String(id)],
    queryFn: () => questApi.getById(id),
    enabled: isStaff,
    retry: false,
  })

  if (!isStaff) return <Navigate to="/quests" replace />
  if (isLoading) return <div className="p-8 opacity-70">Loading map…</div>

  if (isError) {
    return (
      <div className="p-8">
        <p className="mb-2">Couldn’t load this map.</p>
        <p className="text-sm opacity-70">{error?.response?.data?.message || error.message}</p>
      </div>
    )
  }

  // key={dataUpdatedAt}: after a save the refetched data remounts the editor with a fresh baseline
  return (
    <EditorBody
      key={dataUpdatedAt}
      questId={id}
      data={data}
      published={questQuery.data?.published}
    />
  )
}