<template>
  <div class="w-full col-span-full flex flex-col space-y-2">
    <div class="w-full items-center flex flex-row justify-between px-2">
      <div
        class="h-[38px] w-[38px] rounded-md flex items-center justify-center !bg-gray-50"
        @click="goToPage('prev')"
      >
        <app-icon name="arrow-left-black" custom-class="h-[10px]" />
      </div>
      <app-normal-text
        custom-class="!font-semibold underline cursor-pointer"
        @click="selectView()"
      >
        {{ currentMonth }}
      </app-normal-text>
      <div
        class="h-[38px] w-[38px] rounded-md flex items-center justify-center bg-gray-50"
        @click="goToPage('next')"
      >
        <app-icon name="arrow-right-black" custom-class="h-[15px]" />
      </div>
    </div>
    <template v-if="viewType == 'years_12'">
      <div class="w-full grid grid-cols-3 gap-3">
        <div
          class="py-4 flex flex-row items-center col-span-1 justify-center rounded-md hover:bg-gray-100"
          v-for="(year, index) in years12"
          @click="selectYear(year)"
          :key="index"
        >
          <app-normal-text>{{ year }}</app-normal-text>
        </div>
      </div>
    </template>
    <template v-if="viewType == 'year'">
      <div class="w-full grid grid-cols-3 gap-3">
        <div
          class="py-4 flex flex-row items-center col-span-1 justify-center rounded-md hover:bg-gray-100"
          v-for="(month, index) in monthsOptions"
          @click="selectYearMonth(index + 1)"
          :key="index"
        >
          <app-normal-text>{{ month }}</app-normal-text>
        </div>
      </div>
    </template>
    <template v-if="viewType == 'month'">
      <div class="w-full flex flex-row items-center justify-center">
        <app-normal-text
          v-for="(day, index) in daysHeaders"
          :key="index"
          custom-class="!font-semibold flex items-center justify-center !text-gray-800 !text-[11px] w-[14.2857142857%]  "
        >
          {{ day }}
        </app-normal-text>
      </div>

      <div class="w-full flex flex-row flex-wrap items-center justify-start">
        <div
          class="w-[14.2857142857%] flex flex-col items-center justify-center py-[6px] px-[6px]"
          v-for="(item, index) in [...Array(firstDayPosition).keys()]"
          :key="index"
        ></div>
        <div
          :class="`w-[14.2857142857%] flex flex-col items-center justify-center py-[6px] px-[6px]  ${
            disableDate(
              Logic.Common.momentInstance(
                `${
                  (item + 1).toString().length == 1 ? `0${item + 1}` : item + 1
                } ` + currentMonth
              ).add(1, 'hours')
            ) && preventBackDate
              ? 'opacity-[50%]'
              : ''
          }`"
          v-for="(item, index) in [...Array(monthDaysCount).keys()]"
          :key="index"
          @click="
            disableDate(
              Logic.Common.momentInstance(
                `${
                  (item + 1).toString().length == 1 ? `0${item + 1}` : item + 1
                } ` + currentMonth
              ).add(1, 'hours')
            ) && preventBackDate
              ? ''
              : selectDate(item + 1)
          "
        >
          <span
            :class="`w-[36px] h-[36px] rounded-md ${
              dateIsSelected(item + 1) ? 'bg-gray-800  ' : 'bg-gray-100 '
            }  flex justify-center items-center`"
          >
            <app-normal-text
              :color="`${
                dateIsSelected(item + 1) ? '!text-white  ' : '!text-gray-800  '
              } `"
            >
              {{ item + 1 }}
            </app-normal-text>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Logic } from "../../composable";
import { defineComponent, onMounted, ref, watch } from "vue";
import AppIcon from "../AppIcon";
import { AppNormalText } from "../AppTypography";
export default defineComponent({
  components: {
    AppIcon,
    AppNormalText,
  },
  props: {
    padding: {
      type: String,
      default: "py-2 px-4 ",
    },
    closeModal: Function,
    defaultDate: {
      type: String,
    },
    preventBackDate: {
      type: Boolean,
      default: false,
    },
    miminumDate: {
      type: String,
      default: new Date().toString(),
    },
  },
  emits: ["update:modelValue"],
  name: "AppCalendar",
  setup(props, context) {
    const currentMonth = ref("");
    const currentSelectedDay = ref<any>();
    const monthDaysCount = ref(31);

    const minimumDateDay = ref(0);
    const minimumDateMonth = ref(0);
    const minimumDateYear = ref(0);

    minimumDateDay.value = parseInt(
      Logic.Common.momentInstance(props.miminumDate).format("D")
    );
    minimumDateMonth.value = parseInt(
      Logic.Common.momentInstance(props.miminumDate).format("M")
    );
    minimumDateYear.value = parseInt(
      Logic.Common.momentInstance(props.miminumDate).format("YYYY")
    );

    const disableDate = (thisDate: any) => {
      const day = parseInt(thisDate.format("D"));
      const month = parseInt(thisDate.format("M"));
      const year = parseInt(thisDate.format("YYYY"));

      if (year < minimumDateYear.value) {
        return true;
      }

      if (month < minimumDateMonth.value) {
        return true;
      }

      if (
        day < minimumDateDay.value &&
        minimumDateMonth.value == month &&
        minimumDateYear.value == year
      ) {
        return true;
      }

      return false;
    };

    const daysHeaders = ["Mo.", "Tu.", "We.", "Th.", "Fr.", "Sa.", "Su."];
    const monthsOptions = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const years12 = ref<string[]>([]);

    const setCurrent12Years = (
      startYear: string,
      type: "forward" | "backward"
    ) => {
      const yearList: any = [];
      const year = startYear || new Date().getFullYear();
      for (let i = 0; i < 12; i += 1) {
        if (type == "forward") {
          yearList.push((Number(year) + i).toString());
          years12.value = yearList;
        } else {
          yearList.push((Number(year) - i).toString());
          years12.value = yearList.reverse();
        }
      }
    };

    const viewType = ref("month");

    const currentSelectedMonth = ref("");

    const firstDayPosition = ref(0);

    const todayDate = ref(0);

    const setCalenderDate = (date: any) => {
      if (!date) return;
      if (viewType.value == "month") {
        currentMonth.value = date.format("MMMM YYYY");
      }

      if (viewType.value == "year") {
        currentMonth.value = date.format("YYYY");
      }

      monthDaysCount.value = date.daysInMonth();
      currentSelectedMonth.value = date.format("YYYY-MM") + "-01";

      if (currentSelectedDay.value == undefined) {
        currentSelectedDay.value = date;
      }

      const today = Logic.Common.momentInstance(new Date());

      const firstDayOfMonth = Logic.Common.momentInstance(
        currentSelectedMonth.value
      ).format("dd");

      firstDayPosition.value = daysHeaders.indexOf(`${firstDayOfMonth}.`);

      if (currentMonth.value == today.format("MMMM YYYY")) {
        todayDate.value = parseInt(today.format("D"));
      } else {
        todayDate.value = 0;
      }
    };

    const selectYearMonth = (monthIndex: number) => {
      const currentYear =
        currentMonth.value.split(" ").length > 1
          ? currentMonth.value.split(" ")[1]
          : currentMonth.value.split(" ")[0];

      const selectedMonth = Logic.Common.momentInstance(
        `${currentYear}-${
          monthIndex.toString().length == 1 ? `0${monthIndex}` : monthIndex
        }-01`
      );

      setCalenderDate(selectedMonth);

      currentMonth.value = selectedMonth.format("MMMM YYYY");

      currentSelectedDay.value = selectedMonth;

      viewType.value = "month";
    };

    const selectYear = (year: string) => {
      currentMonth.value = year;
      viewType.value = "year";
    };

    watch(viewType, () => {
      if (viewType.value == "year") {
        // currentMonth.value = Logic.Common.momentInstance(
        //   currentSelectedMonth.value
        // ).format("YYYY");
      }

      if (viewType.value == "years_12") {
        currentMonth.value = `${years12.value[0]} - ${
          years12.value[years12.value.length - 1]
        }`;
      }
    });

    const dateIsSelected = (day: number) => {
      const selectedDay = `${currentSelectedDay.value?.format("YYYY-MM-DD")}`;

      const currentDate =
        `${day.toString().length == 1 ? `0${day}` : day} ` + currentMonth.value;

      return (
        Logic.Common.momentInstance(currentDate).format("YYYY-MM-DD") ==
        selectedDay
      );
    };

    onMounted(() => { 
      if (props.defaultDate) {
        setCalenderDate(Logic.Common.momentInstance(props.defaultDate));
        setCurrent12Years(
          Logic.Common.momentInstance(props.defaultDate).format("YYYY"),
          "forward"
        );
      } else {
        setCalenderDate(Logic.Common.momentInstance(new Date()));
        setCurrent12Years(
          Logic.Common.momentInstance(new Date()).format("YYYY"),
          "forward"
        );
      }
    });

    const selectDate = (day: number) => {
      currentSelectedDay.value = Logic.Common.momentInstance(
        `${day.toString().length == 1 ? `0${day}` : day} ` + currentMonth.value
      ).add(1, "hours");
      context.emit(
        "update:modelValue",
        currentSelectedDay.value.format("YYYY-MM-DD")
      );
      props.closeModal ? props.closeModal() : null;
    };

    watch(currentSelectedDay, () => {
      context.emit(
        "update:modelValue",
        currentSelectedDay.value.format("YYYY-MM-DD")
      );
    });

    const selectView = () => {
      if (viewType.value == "month") {
        viewType.value = "years_12";
      } else if (viewType.value == "year") {
        viewType.value = "years_12";
      }
    };

    const goToPage = (directions: "prev" | "next") => {
      if (directions == "prev") {
        if (viewType.value == "month") {
          setCalenderDate(
            Logic.Common.momentInstance(currentSelectedMonth.value).subtract(
              1,
              "months"
            )
          );
        }

        if (viewType.value == "year") {
          setCalenderDate(
            Logic.Common.momentInstance(currentSelectedMonth.value).subtract(
              1,
              "years"
            )
          );
        }

        if (viewType.value == "years_12") {
          setCurrent12Years(
            (parseInt(years12.value[0]) - 1).toString(),
            "backward"
          );
          currentMonth.value = `${years12.value[0]} - ${
            years12.value[years12.value.length - 1]
          }`;
        }
      }

      if (directions == "next") {
        if (viewType.value == "month") {
          setCalenderDate(
            Logic.Common.momentInstance(currentSelectedMonth.value).add(
              1,
              "months"
            )
          );
        }

        if (viewType.value == "year") {
          setCalenderDate(
            Logic.Common.momentInstance(currentSelectedMonth.value).add(
              1,
              "years"
            )
          );
        }

        if (viewType.value == "years_12") {
          setCurrent12Years(
            (parseInt(years12.value[years12.value.length - 1]) + 1).toString(),
            "forward"
          );
          currentMonth.value = `${years12.value[0]} - ${
            years12.value[years12.value.length - 1]
          }`;
        }
      }
    };

    return {
      currentSelectedMonth,
      todayDate,
      Logic,
      setCalenderDate,
      viewType,
      currentMonth,
      daysHeaders,
      monthDaysCount,
      firstDayPosition,
      currentSelectedDay,
      dateIsSelected,
      monthsOptions,
      selectYearMonth,
      selectDate,
      selectYear,
      years12,
      selectView,
      goToPage,
      disableDate,
    };
  },
});
</script>
