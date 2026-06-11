#!/usr/bin/env zsh
set -euo pipefail
setopt typeset_silent

ROOT_NODE="YQBnd5ExVEwxO1wvc2rEk2kx8yeZqMmz"
OUT_ROOT="设备中心"
MANIFEST="$OUT_ROOT/_manifest.tsv"
FAILED="$OUT_ROOT/_failed.tsv"

sanitize_name() {
  local name="$1"
  name="${name//$'\n'/ }"
  name="${name//$'\r'/ }"
  name="${name//\//-}"
  name="${name//:/：}"
  name="${name//\*/-}"
  name="${name//\"/'}"
  name="${name//</＜}"
  name="${name//>/＞}"
  name="${name//|/-}"
  name="$(printf '%s' "$name" | sed -E 's/[[:space:]]+$//; s/^[[:space:]]+//')"
  [[ -n "$name" ]] || name="未命名"
  printf '%s' "$name"
}

unique_path() {
  local path="$1"
  if [[ ! -e "$path" ]]; then
    printf '%s' "$path"
    return
  fi

  local dir="${path:h}"
  local file="${path:t}"
  local stem="${file:r}"
  local ext="${file:e}"
  local i=2
  local candidate

  while true; do
    if [[ -n "$ext" && "$file" == *.* ]]; then
      candidate="$dir/$stem ($i).$ext"
    else
      candidate="$dir/$file ($i)"
    fi
    if [[ ! -e "$candidate" ]]; then
      printf '%s' "$candidate"
      return
    fi
    ((i++))
  done
}

list_children() {
  local node="$1"
  local page_token=""
  while true; do
    local response
    if [[ -n "$page_token" ]]; then
      response="$(dws doc list --folder "$node" --page-size 50 --page-token "$page_token" --format json)"
    else
      response="$(dws doc list --folder "$node" --page-size 50 --format json)"
    fi
    printf '%s\n' "$response" | jq -c '.nodes[]?'
    if [[ "$(printf '%s' "$response" | jq -r '.hasMore // false')" != "true" ]]; then
      break
    fi
    page_token="$(printf '%s' "$response" | jq -r '.nextPageToken // empty')"
    [[ -n "$page_token" ]] || break
  done
}

save_doc() {
  local node_id="$1"
  local title="$2"
  local extension="$3"
  local out_dir="$4"
  local doc_url="$5"
  local fallback_name
  fallback_name="$(sanitize_name "$title")"

  if [[ "$extension" != "adoc" ]]; then
    local link_path
    link_path="$out_dir/$fallback_name.$extension.md"
    {
      printf '# %s\n\n' "$title"
      printf '> 钉钉节点：%s\n\n' "$node_id"
      printf '当前 dws 文档接口不支持将 `%s` 类型导出为本地内容文件。\n\n' "$extension"
      printf '钉钉链接：%s\n' "$doc_url"
    } > "$link_path"
    printf 'LINK\t%s\t%s\t%s\n' "$node_id" "$title" "$link_path" >> "$MANIFEST"
    printf 'SKIP\t%s\t%s\tunsupported extension: %s\n' "$node_id" "$title" "$extension" >> "$FAILED"
    return
  fi

  local response
  if ! response="$(dws doc read --node "$node_id" --format json 2>&1)"; then
    printf 'FAIL\t%s\t%s\t%s\n' "$node_id" "$title" "$response" >> "$FAILED"
    return
  fi

  local doc_title
  doc_title="$(printf '%s' "$response" | jq -r '.title // empty')"
  [[ -n "$doc_title" ]] || doc_title="$fallback_name"

  local file_path
  file_path="$out_dir/$(sanitize_name "$doc_title").md"

  {
    printf '# %s\n\n' "$doc_title"
    printf '> 钉钉节点：%s\n\n' "$node_id"
    printf '%s' "$response" | jq -r '.markdown // ""'
    printf '\n'
  } > "$file_path"

  printf 'FILE\t%s\t%s\t%s\n' "$node_id" "$title" "$file_path" >> "$MANIFEST"
}

walk() {
  local node="$1"
  local out_dir="$2"
  mkdir -p "$out_dir"

  list_children "$node" | while IFS= read -r item; do
    local node_type node_id name extension has_children safe_name child_dir doc_url
    node_type=$(printf '%s' "$item" | jq -r '.nodeType')
    node_id=$(printf '%s' "$item" | jq -r '.nodeId')
    name=$(printf '%s' "$item" | jq -r '.name')
    extension=$(printf '%s' "$item" | jq -r '.extension // ""')
    has_children=$(printf '%s' "$item" | jq -r '.hasChildren // false')
    doc_url=$(printf '%s' "$item" | jq -r '.docUrl // ""')
    safe_name="$(sanitize_name "$name")"

    if [[ "$node_type" == "folder" ]]; then
      child_dir="$out_dir/$safe_name"
      mkdir -p "$child_dir"
      printf 'DIR\t%s\t%s\t%s\n' "$node_id" "$name" "$child_dir" >> "$MANIFEST"
      walk "$node_id" "$child_dir"
    else
      save_doc "$node_id" "$name" "$extension" "$out_dir" "$doc_url"
      if [[ "$has_children" == "true" ]]; then
        child_dir="$out_dir/$safe_name"
        mkdir -p "$child_dir"
        printf 'DIR\t%s\t%s\t%s\n' "$node_id" "$name children" "$child_dir" >> "$MANIFEST"
        walk "$node_id" "$child_dir"
      fi
    fi
  done
}

mkdir -p "$OUT_ROOT"
printf 'type\tnodeId\tname\tlocalPathOrReason\n' > "$MANIFEST"
printf 'status\tnodeId\tname\treason\n' > "$FAILED"
walk "$ROOT_NODE" "$OUT_ROOT"
