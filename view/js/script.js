
function MeetingScheduler() {
  const oldMeetList = window.meetingsList.map((val) => {
    val.startMicro = this.getMicro(val.startDate, val.startTime);
    val.endMicro = this.getMicro(val.endDate, val.endTime);
    return val;
  })
  this.meetingsList = [...oldMeetList];
  this.activeTab = 1;
}

MeetingScheduler.prototype.addNewMeeting = function() {
  const buildingName = this.$buildingName.value;
  const floorNumber = this.$floorNumber.value;
  const meetingRoomName = this.$meetingRoomName.value;
  const startDate = this.$startDate.value;
  const startTime = this.$startTime.value;
  const endDate = this.$endDate.value;
  const endTime = this.$endTime.value;
  if (!buildingName || !floorNumber || !meetingRoomName || !startDate || !startTime || !endDate || !endTime) {
   this.handleError(true);
    return null;
  }
  this.handleError(false);
  const value = {
    startDate, startTime, endDate, endTime,
    startMicro: this.getMicro(startDate, startTime),
    endMicro: this.getMicro(endDate, endTime),
    buildingName, floorNumber, meetingRoomName
  };
  const errorText = this.checkIfMeetingRoomFree(value);
  if (errorText) {
    this.handleError(true, errorText);
    return null;
  }
  this.meetingsList = [...this.meetingsList, {...value}];
  this.resetInfo();
  this.updateMeetingCard(value)
};

MeetingScheduler.prototype.checkIfMeetingRoomFree = function(currentMeetingInfo) {
  let isBooked = false;
  this.meetingsList.forEach((value) => {
    const isSameLocation = (currentMeetingInfo.buildingName === value.buildingName && currentMeetingInfo.floorNumber === value.floorNumber && currentMeetingInfo.meetingRoomName === value.meetingRoomName);
    const isSameTime = (currentMeetingInfo.startMicro >= value.startMicro && currentMeetingInfo.startMicro <= value.endMicro) || (currentMeetingInfo.endMicro >= value.startMicro && currentMeetingInfo.endMicro <= value.endMicro);
    if (isSameTime && isSameLocation) {
      isBooked = true;
    }
  });
  if (isBooked) {
    return 'The room is Unavailable';
  }
  return '';
};

MeetingScheduler.prototype.handleError = function(showError, errorText = 'Invalid Input!') {
  if (showError) {
    this.$error.classList.remove('dn');
    this.$error.innerText = errorText;
    return;
  }
  this.$error.classList.add('dn');
};

MeetingScheduler.prototype.getMicro = function(date, time) {
  const dateArr = date.split('-').map((val) => parseInt(val, 10));
  dateArr[1] = dateArr[1] - 1;
  const timeArr = time.split(':').map((val) => parseInt(val, 10));
  const args = [...dateArr, ...timeArr];
  return new Date(...args).getTime();
};

MeetingScheduler.prototype.loadTabContent = function(activeTab) {
  this.activeTab = activeTab;
  if (this.activeTab === 1) {
    this.$todayTab.classList.remove('activeTab');
    this.$allMeetingsTab.classList.add('activeTab');
  } else {
    this.$todayTab.classList.add('activeTab');
    this.$allMeetingsTab.classList.remove('activeTab');
  }
  const tabData = this.getSelectedTabData();
};

MeetingScheduler.prototype.isToday = function(startMicro) {
  const dateNow = new Date();
  const todayStartMs = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate()).getTime();
  const todayStart = new Date(todayStartMs);
  const tomorrowStartMs = new Date(todayStart.setDate(todayStart.getDate() + 1)).getTime();
  return (startMicro >= todayStartMs && startMicro < tomorrowStartMs);
}

MeetingScheduler.prototype.updateMeetingCard = function(value) {
  if ((this.activeTab === 2 && this.isToday(value.startMicro)) || (this.activeTab === 1)) {
    this.$meetingSummary.appendChild(this.getCard(value));
  }
};

MeetingScheduler.prototype.getSelectedTabData = function() {
  this.$meetingSummary.innerHTML = '';
  this.meetingsList.forEach((value) => {
    this.updateMeetingCard(value);
  });
}

MeetingScheduler.prototype.getCard = function(data) {
  const $ul = document.createElement('ul');
  $ul.className = "card d-inbl textCenter";
  $ul.innerHTML = `
    <li>
      <div class="fb">${data.buildingName} - ${data.floorNumber} - ${data.meetingRoomName}</div>
      <div class="padT10">
        <span class="fb">Starts at:</span>
        <span>${new Date(data.startDate).toDateString()},</span>
        <span>${data.startTime}</span>
      </div>
      <div class="padT10">
        <span class="fb">Ends at:</span>
        <span>${new Date(data.endDate).toDateString()},</span>
        <span>${data.endTime}</span>
      </div>
    </li>`;
  return $ul;
};

MeetingScheduler.prototype.resetInfo = function() {
  this.$buildingName.value = 'Block A';
  this.$floorNumber.value = 'Floor 1';
  this.$meetingRoomName.value = 'Meeting Room 1';
  this.$startDate.value = '';
  this.$startTime.value = '00:00';
  this.$endDate.value = '';
  this.$endTime.value = '00:00';
};

MeetingScheduler.prototype.initiateEventListeners = function() {
  this.$scheduleBtn.addEventListener('click', this.addNewMeeting.bind(this));
  this.$allMeetingsTab.addEventListener('click', this.loadTabContent.bind(this, 1));
  this.$todayTab.addEventListener('click', this.loadTabContent.bind(this, 2));
};

MeetingScheduler.prototype.init = function() {
  this.$buildingName = document.getElementById('buildingName');
  this.$floorNumber = document.getElementById('floorNumber');
  this.$meetingRoomName = document.getElementById('meetingRoomName');
  this.$startDate = document.getElementById('startDate');
  this.$startTime = document.getElementById('startTime');
  this.$endDate = document.getElementById('endDate');
  this.$endTime = document.getElementById('endTime');
  this.$scheduleBtn = document.getElementById('scheduleBtn');
  this.$todayTab = document.getElementById('todayTab');
  this.$allMeetingsTab = document.getElementById('allMeetingsTab');
  this.$meetingSummary = document.getElementById('meetingSummary');
  this.$error = document.getElementById('error');
  this.initiateEventListeners();
}

const meetingScheduler = new MeetingScheduler();
meetingScheduler.init();