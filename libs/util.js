export function formatTime(ts) {
  const dateToFormat = new Date(ts * 1000);
  const minutes = `0${dateToFormat.getMinutes()}`;
  const hours = dateToFormat.getHours();
  const day = dateToFormat.getDate();
  const month = dateToFormat.getMonth();
  const year = dateToFormat.getFullYear();
  const ampm = hours <= 12 ? 'am' : 'pm';

  const todayFormat = `${hours}:${minutes.substr(-2)} ${ampm}`;
  const beforeYesterdayFormat = `${day}/${month}/${year}`;

  const tempTs = new Date();
  const todayTs = tempTs.setHours(0, 0, 0, 0) / 1000;
  const yesterdayTs = todayTs - (24 * 60 * 60);

  let formattedTime = '';
  if (ts > todayTs) {
    formattedTime = todayFormat;
  } else if (yesterdayTs < ts && ts < todayTs) {
    formattedTime = 'Yesterday';
  } else if (ts < yesterdayTs) {
    formattedTime = beforeYesterdayFormat;
  }
  return formattedTime;
}

export function formatValue(value) {
  switch (true) {
    case (value < 1000):
      break;
    case (value < 1000000):
      value /= 1000;
      break;
    case (value < 1000000000):
      value /= 1000000;
      break;
    case (value < 1000000000000):
      value /= 1000000000;
      break;
    case (value < 1000000000000000):
      value /= 1000000000000;
      break;
  }
  return value;
}

export function formatUnit(value) {
  let unit = '';
  switch (true) {
    case (value < 1000):
      unit = 'i';
      break;
    case (value < 1000000):
      unit = 'Ki';
      break;
    case (value < 1000000000):
      unit = 'Mi';
      break;
    case (value < 1000000000000):
      unit = 'Gi';
      break;
    case (value < 1000000000000000):
      unit = 'Ti';
      break;
  }
  return unit;
}

export function formatIota(value) {
  const iota = formatValue(value);
  const unit = formatUnit(value);
  const formatted = `${iota} ${unit}`;
  return formatted;
}

export function round(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
