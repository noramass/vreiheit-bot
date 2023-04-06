create or replace function toggle_poll_choice(pollid uuid, uid text, opt text) returns boolean
  language plpgsql
as
$$
declare enabled boolean;
begin
  update "poll"
  set "counts" = case
    when "single" then jsonb_set("counts"::jsonb, array[(uid)], to_jsonb((opt)))
      when not ("counts"::jsonb ? (uid))
        then jsonb_set("counts"::jsonb, array[(uid)], jsonb_build_array((opt)))
      when ("counts"::jsonb -> (uid)) ? (opt)
        then jsonb_set("counts"::jsonb, array[(uid)], ("counts" -> (uid)) - (opt))
      else jsonb_insert("counts"::jsonb, array[(uid), '0'], to_jsonb((opt)))
    end
  where "id" = (pollId)
  returning case
    when "single" then true
    else ("counts"::jsonb -> (uid)) ? (opt)
  end into "enabled";
  return enabled;
end
$$;
