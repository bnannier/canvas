package io.ionize.canvas.blur

import android.content.Context
import android.view.View
import android.widget.FrameLayout
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class TargetSafetyTest {
  private val instrumentation = InstrumentationRegistry.getInstrumentation()
  private val context: Context get() = instrumentation.targetContext

  // A host that reports itself in a window. The verdict asks only whether the host is
  // attached, which a view gains from a real window; this stands in for one.
  private class Attached(context: Context) : FrameLayout(context) {
    override fun isAttachedToWindow() = true
  }

  @Test
  fun refusesAnAncestorAtAnyDepthAttachedOrNot() {
    instrumentation.runOnMainSync {
      for (host in listOf(FrameLayout(context), Attached(context))) {
        val middle = FrameLayout(context)
        val frost = View(context)
        host.addView(middle)
        middle.addView(frost)
        assertEquals(TargetVerdict.ANCESTOR, targetVerdict(frost, host))
        assertEquals(TargetVerdict.ANCESTOR, targetVerdict(frost, middle))
        assertEquals("ancestor", targetVerdict(frost, host).reason)
      }
    }
  }

  @Test
  fun samplesASiblingInAWindowAndWaitsForOneThatIsNot() {
    instrumentation.runOnMainSync {
      val root = FrameLayout(context)
      val frost = View(context)
      root.addView(frost)
      val attached = Attached(context)
      val detached = FrameLayout(context)
      root.addView(attached)
      // A host in another window shares no parent with the frost at all.
      val elsewhere = Attached(context)
      assertEquals(TargetVerdict.SAFE, targetVerdict(frost, attached))
      assertEquals(TargetVerdict.SAFE, targetVerdict(frost, elsewhere))
      assertEquals(TargetVerdict.DETACHED, targetVerdict(frost, detached))
      assertEquals(null, TargetVerdict.SAFE.reason)
      assertEquals(null, TargetVerdict.DETACHED.reason)
    }
  }

  @Test
  fun reportsEachRefusedTargetOnceAndOnlyARefusal() {
    val reports = mutableListOf<Pair<Int, String>>()
    val rejections = TargetRejections { id, reason -> reports.add(id to reason) }
    // Every frame checks the target again: one report for the same refusal.
    repeat(3) { rejections.record(7, TargetVerdict.ANCESTOR) }
    rejections.record(7, TargetVerdict.SAFE)
    rejections.record(7, TargetVerdict.DETACHED)
    assertEquals(listOf(7 to "ancestor"), reports)
    // A new target is news, and so is the same id once the frost names a target afresh.
    rejections.record(9, TargetVerdict.ANCESTOR)
    rejections.reset()
    rejections.record(9, TargetVerdict.ANCESTOR)
    rejections.record(9, TargetVerdict.ANCESTOR)
    assertEquals(listOf(7 to "ancestor", 9 to "ancestor", 9 to "ancestor"), reports)
    // A detached or safe target is never reported, however often it is checked.
    rejections.reset()
    repeat(2) { rejections.record(11, TargetVerdict.DETACHED) }
    rejections.record(11, TargetVerdict.SAFE)
    assertEquals(3, reports.size)
  }
}
