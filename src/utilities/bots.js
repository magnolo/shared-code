import { fetch } from '../config/environment';

export const snitch = async message => {
  await fetch('https://hooks.slack.com/services/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', {
    method: 'post',
    body: JSON.stringify({ text: `psssst... ${message}` }),
    headers: { 'Content-Type': 'application/json' }
  });
};
