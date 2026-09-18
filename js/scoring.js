/**
 * โมดูลคำนวณและประมวลผลคะแนนพหุปัญญา (Scoring Engine)
 * ตามเกณฑ์มาตรฐาน สำนักงานเลขาธิการสภาการศึกษา
 */

class MIScoring {
  /**
   * คำนวณผลคะแนนรายด้านและภาพรวม
   * @param {Object} answers แมป { [questionId]: optionId }
   * @returns {Object} ผลลัพธ์การประเมิน
   */
  static calculate(answers) {
    const dimensionResults = [];
    let totalScore = 0;
    let totalQuestions = MI_QUESTIONS.length;
    let totalAnswered = 0;
    let totalOption5 = 0;

    // คำนวณทีละด้าน (1 - 9)
    MI_DIMENSIONS.forEach(dim => {
      const dimQuestions = MI_QUESTIONS.filter(q => q.dimensionId === dim.id);
      let rawScore = 0;
      let answeredCount = 0;
      let option5Count = 0;
      const questionDetails = [];

      dimQuestions.forEach(q => {
        const chosenOption = answers[q.id];
        if (chosenOption !== undefined && chosenOption !== null) {
          answeredCount++;
          if (chosenOption === 5) {
            option5Count++;
          }
          const scoringRule = q.scoring[chosenOption] || { score: 0, level: 1 };
          rawScore += scoringRule.score;
          questionDetails.push({
            questionId: q.id,
            chosenOption,
            score: scoringRule.score,
            level: scoringRule.level
          });
        }
      });

      totalAnswered += answeredCount;
      totalOption5 += option5Count;
      totalScore += rawScore;

      // แปลงคะแนนดิบ (เต็ม 10) เป็นร้อยละ
      const percentage = Math.round((rawScore / 10) * 100);

      // ตัดเกณฑ์ระดับพหุปัญญา
      let level = 1;
      if (option5Count >= 2) {
        level = 0;
      } else if (percentage >= 84) {
        level = 4;
      } else if (percentage >= 76) {
        level = 3;
      } else if (percentage >= 30) {
        level = 2;
      } else {
        level = 1;
      }

      dimensionResults.push({
        dimension: dim,
        rawScore,
        maxScore: 10,
        percentage,
        option5Count,
        answeredCount,
        totalInDimension: dimQuestions.length,
        level,
        levelInfo: LEVEL_INFO[level],
        questionDetails
      });
    });

    // ตรวจสอบเงื่อนไขภาพรวมระดับ 0
    const isOverallLevel0 = (totalOption5 >= 15) || (totalAnswered > 0 && (totalOption5 / totalAnswered) >= 0.35);

    // หาจุดเด่น 3 อันดับแรก (Top Strengths)
    const validDimensions = [...dimensionResults].filter(d => d.level > 0);
    validDimensions.sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return b.rawScore - a.rawScore;
    });

    const topStrengths = validDimensions.slice(0, 3);

    return {
      dimensionResults,
      totalStats: {
        totalScore,
        maxTotalScore: 90,
        totalAnswered,
        totalQuestions,
        totalOption5,
        isOverallLevel0,
        averagePercentage: Math.round((totalScore / 90) * 100)
      },
      topStrengths
    };
  }

  /**
   * สร้างคำแปลผลและข้อแนะนำรายบุคคล
   * @param {Object} results ผลการประเมินจาก MIScoring.calculate
   * @returns {Object} สรุปความเรียงแปลผล
   */
  static getSummaryNarrative(results) {
    const { totalStats, topStrengths, dimensionResults } = results;

    if (totalStats.isOverallLevel0) {
      return {
        summaryText: "ผลการประเมินอยู่ใน 'ระดับ 0 (ข้อมูลไม่เพียงพอ)' เนื่องจากผู้เรียนเลือกตัวเลือก 'ไม่สามารถประเมินได้' เป็นจำนวนมาก (ตั้งแต่ 15 ข้อขึ้นไป หรือคิดเป็น 35% ขึ้นไปของแบบประเมิน) แสดงว่าผู้เรียนอาจยังไม่เคยสำรวจความถนัดของตนเอง หรือยังไม่พร้อมทำแบบประเมิน แนะนำให้ครูผู้สอนให้คำปรึกษาและจัดกิจกรรมสำรวจตนเองก่อนทำแบบประเมินใหม่อีกครั้ง",
        recommendations: [
          "เปิดโอกาสให้ผู้เรียนได้ทดลองทำกิจกรรมที่หลากหลาย ทั้งด้านภาษา วิทยาศาสตร์ ศิลปะ ดนตรี กีฬา และงานกลุ่ม",
          "จัดกิจกรรมแนะแนวเพื่อช่วยค้นหาความชอบและความถนัดรายบุคคล",
          "เว้นระยะเวลา 2-4 สัปดาห์ แล้วให้ผู้เรียนทำแบบประเมินใหม่อีกครั้ง"
        ]
      };
    }

    if (topStrengths.length === 0) {
      return {
        summaryText: "ผู้เรียนอยู่ในระดับเริ่มต้นสำรวจความถนัดในทุกด้าน ยังไม่พบด้านที่มีความโดดเด่นเป็นพิเศษชัดเจน",
        recommendations: [
          "ควรส่งเสริมให้เข้าร่วมกิจกรรมหลากหลายเพื่อค้นพบตนเอง"
        ]
      };
    }

    const strengthNames = topStrengths.map(s => `${s.dimension.name} (${s.percentage}%)`).join(", ");
    const highest = topStrengths[0];

    return {
      summaryText: `ผู้เรียนมีแนวโน้มความโดดเด่นและศักยภาพสูงสุดใน ${strengthNames} โดยเฉพาะอย่างยิ่ง **${highest.dimension.name}** ซึ่งอยู่ใน ${highest.levelInfo.title} สะท้อนถึง ${highest.dimension.description}`,
      recommendations: topStrengths.map(s => `**${s.dimension.name}:** ${s.dimension.guidance}`)
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MIScoring;
}
