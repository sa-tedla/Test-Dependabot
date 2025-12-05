export function formatDate(datetime: string | undefined): string {
  if (!datetime || datetime === '') return '';

  const date = new Date(datetime);
  const now = new Date();
  const oneDayInMillis = 24 * 60 * 60 * 1000; // 1日のミリ秒数

  if (now.getTime() - date.getTime() < oneDayInMillis) {
    // 1日経過していない場合
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } else {
    // 1日以上経過している場合
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}
