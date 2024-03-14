create or replace procedure public.sp_update_diff_sx3(p_uuid varchar, p_tabela varchar)
language plpgsql
as $$
declare
       v_query_select_dict_1 varchar;
       v_query_diff varchar;
       reg record;
       reg_diff record;
       diff_count int := 0;
      _rows int := 0;

begin

    -- Marca registros que existe no dicionário 1, mas não existem no dicionário 2
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join sx3010 s2 on (s2.uuid = s.uuid and s2.dict = 2 and	s2.x3_arquivo = s.x3_arquivo and s2.x3_ordem = s.x3_ordem and s2.x3_titulo = s.x3_titulo) where s.uuid = ''' || p_uuid || ''' and s.dict = 1 and s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existe no dicionário 2, mas não existem no dicionário 1
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join sx3010 s2 on (s2.uuid = s.uuid and s2.dict = 1 and	s2.x3_arquivo = s.x3_arquivo and s2.x3_ordem = s.x3_ordem and s2.x3_titulo = s.x3_titulo) where s.uuid = ''' || p_uuid || ''' and s.dict = 2 and s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existem dos dois dicionários, mas possuem diferenças
	v_query_select_dict_1 := 'select s.id, s2.id as id_diff from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
							(
								s2.uuid = s.uuid and 
								s2.dict = 2 and
								s2.x3_arquivo = s.x3_arquivo and 
								s2.x3_ordem = s.x3_ordem and 
								s2.x3_titulo = s.x3_titulo and
								s2.x3_campo = s.x3_campo and
								s.x3_tipo     =  s2.x3_tipo and 
								(
								    s.x3_tamanho  <>  s2.x3_tamanho  or
								    s.x3_decimal  <>  s2.x3_decimal  or
								    s.x3_titulo   <>  s2.x3_titulo   or
								    s.x3_titspa   <>  s2.x3_titspa   or
								    s.x3_titeng   <>  s2.x3_titeng   or
								    s.x3_descric  <>  s2.x3_descric  or
								    s.x3_descspa  <>  s2.x3_descspa  or
								    s.x3_desceng  <>  s2.x3_desceng  or
								    s.x3_picture  <>  s2.x3_picture  or
								    s.x3_valid    <>  s2.x3_valid    or
								    s.x3_usado    <>  s2.x3_usado    or
								    s.x3_relacao  <>  s2.x3_relacao  or
								    s.x3_f3       <>  s2.x3_f3       or
								    s.x3_nivel    <>  s2.x3_nivel    or
								    s.x3_reserv   <>  s2.x3_reserv   or
								    s.x3_check    <>  s2.x3_check    or
								    s.x3_trigger  <>  s2.x3_trigger  or
								    s.x3_propri   <>  s2.x3_propri   or
								    s.x3_browse   <>  s2.x3_browse   or
								    s.x3_visual   <>  s2.x3_visual   or
								    s.x3_context  <>  s2.x3_context  or
								    s.x3_obrigat  <>  s2.x3_obrigat  or
								    s.x3_vlduser  <>  s2.x3_vlduser  or
								    s.x3_cbox     <>  s2.x3_cbox     or
								    s.x3_cboxspa  <>  s2.x3_cboxspa  or
								    s.x3_cboxeng  <>  s2.x3_cboxeng  or
								    s.x3_pictvar  <>  s2.x3_pictvar  or
								    s.x3_when     <>  s2.x3_when     or
								    s.x3_inibrw   <>  s2.x3_inibrw   or
								    s.x3_grpsxg   <>  s2.x3_grpsxg   or
								    s.x3_folder   <>  s2.x3_folder   or
								    s.x3_pyme     <>  s2.x3_pyme     or
								    s.x3_condsql  <>  s2.x3_condsql  or
								    s.x3_chksql   <>  s2.x3_chksql   or
								    s.x3_idxsrv   <>  s2.x3_idxsrv   or
								    s.x3_ortogra  <>  s2.x3_ortogra  or
								    s.x3_idxfld   <>  s2.x3_idxfld   or
								    s.x3_tela     <>  s2.x3_tela     or
								    s.x3_picbrv   <>  s2.x3_picbrv   or
								    s.x3_agrup    <>  s2.x3_agrup    or
								    s.x3_poslgt   <>  s2.x3_poslgt   or
								    s.x3_modal    <>  s2.x3_modal
								)
							)
							where s.uuid = ''' || p_uuid || ''' and s.dict = 1 and s2.id is not null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id, diff_count;	                	
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id_diff, diff_count;
		
	end loop;
end 
$$;

