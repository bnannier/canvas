package io.ionize.canvas.blur

import android.view.View

/** What a frost may do with a capture host it was handed. */
internal enum class TargetVerdict(val reason: String?) {
  /** A sibling, a cousin or a host in another window: sampled. */
  SAFE(null),

  /**
   * The host contains the frost, so its recording would draw the frost that samples it:
   * a render-node cycle. Refused, and reported with this reason so the app can fall back.
   */
  ANCESTOR("ancestor"),

  /** The host is in no window. Refused without a report: its own availability event withdraws it. */
  DETACHED(null),
}

/** The verdict for `consumer` sampling `candidate`; ancestry is checked first, at any depth. */
internal fun targetVerdict(consumer: View, candidate: View): TargetVerdict {
  var ancestor = consumer.parent
  while (ancestor != null) {
    if (ancestor === candidate) return TargetVerdict.ANCESTOR
    ancestor = ancestor.parent
  }
  return if (candidate.isAttachedToWindow) TargetVerdict.SAFE else TargetVerdict.DETACHED
}

/**
 * Reports each refused target once. The frost checks its target before every frame, so
 * without this a misplaced frost would report the same refusal on every draw.
 */
internal class TargetRejections(private val report: (targetId: Int, reason: String) -> Unit) {
  private var reported: Int? = null

  fun record(targetId: Int, verdict: TargetVerdict) {
    val reason = verdict.reason ?: return
    if (reported == targetId) return
    reported = targetId
    report(targetId, reason)
  }

  /** A new target id starts over: its refusal is news. */
  fun reset() {
    reported = null
  }
}
